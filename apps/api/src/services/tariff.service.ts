import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { TariffRateCache } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { buildPagedResult } from '../common/utils/pagination';
import { TariffQuoteDto } from '../dto/tariff.dto';
import { PrismaService } from '../prisma/prisma.service';

type SupportedCountry = {
  aliases: string[];
  code: string;
  name: string;
  reporterCode: string;
  vatRate: number;
  defaultAdditionalTaxRate: number;
};

type OriginCountry = {
  aliases: string[];
  iso3: string;
  name: string;
  reporterCode: string;
};

type AvailabilityEntry = {
  year: number;
  nomenclatureCode: string | null;
  nomenclatureName: string | null;
  partnerCodes: string[];
  hasEstimatedSpecificDuty: boolean;
  lastUpdatedDate: string | null;
};

type TariffLookup = {
  productDescription: string | null;
  nomenclatureName: string | null;
  tariffType: string | null;
  simpleAverageRate: number;
  minRate: number | null;
  maxRate: number | null;
  totalLines: number | null;
  preferentialLines: number | null;
  mfnLines: number | null;
};

type CountryChargeRule = {
  applies: (input: {
    hsCode: string;
    customsValue: number;
    currency: string;
    destinationCountryCode: string;
  }) => boolean;
  code: string;
  label: string;
  kind: 'rate' | 'fixed';
  rate?: number;
  fixedAmount?: number;
  currency?: string;
  note: string;
};

type QuoteResponse = {
  id?: string;
  country: { code: string; name: string };
  originCountry: { code: string; name: string } | null;
  hsCode: string;
  productDescription: string | null;
  year: number;
  dataSource: {
    provider: string;
    pricing: string;
    reporterCode: string;
    partnerCode: string;
    nomenclatureCode: string | null;
    nomenclatureName: string | null;
    lastUpdatedDate: string | null;
    cacheHit: boolean;
    cacheExpiresAt: string | null;
  };
  tariff: {
    tariffType: string | null;
    simpleAverageRate: number;
    minRate: number | null;
    maxRate: number | null;
    totalLines: number | null;
    mfnLines: number | null;
    preferentialLines: number | null;
  };
  calculation: {
    currency: string;
    invoiceValue: number;
    freightCost: number;
    insuranceCost: number;
    customsValue: number;
    dutyRate: number;
    dutyAmount: number;
    minDutyAmount: number | null;
    maxDutyAmount: number | null;
    vatRate: number;
    vatBase: number;
    vatAmount: number;
    additionalTaxLabel: string;
    additionalTaxRate: number;
    additionalTaxAmount: number;
    totalTaxAmount: number;
    landedCost: number;
    countrySpecificCharges: Array<{
      code: string;
      label: string;
      kind: 'rate' | 'fixed';
      rate: number | null;
      amount: number;
      note: string;
    }>;
  };
  warnings: string[];
  nextFallbacks: Array<{ provider: string; pricing: string; note: string }>;
};

const SUPPORTED_COUNTRIES: SupportedCountry[] = [
  {
    aliases: ['TJ', 'TJK', 'TAJIKISTAN'],
    code: 'TJK',
    name: 'Tajikistan',
    reporterCode: '762',
    vatRate: 14,
    defaultAdditionalTaxRate: 0,
  },
];

const KNOWN_ORIGINS: OriginCountry[] = [
  {
    aliases: ['US', 'USA', 'UNITED STATES', 'UNITED STATES OF AMERICA'],
    iso3: 'USA',
    name: 'United States',
    reporterCode: '840',
  },
  {
    aliases: ['KZ', 'KAZ', 'KAZAKHSTAN'],
    iso3: 'KAZ',
    name: 'Kazakhstan',
    reporterCode: '398',
  },
  {
    aliases: ['TJ', 'TJK', 'TAJIKISTAN'],
    iso3: 'TJK',
    name: 'Tajikistan',
    reporterCode: '762',
  },
];

const CACHE_TTL_DAYS = 7;
const LOCAL_FALLBACK_YEAR = 2021;

const LOCAL_FALLBACK_TARIFFS: Record<string, TariffLookup> = {
  '851713': {
    productDescription: 'Smartphones for cellular networks or other wireless networks',
    nomenclatureName: 'Harmonized System 2012',
    tariffType: 'MFN',
    simpleAverageRate: 0,
    minRate: 0,
    maxRate: 0,
    totalLines: 1,
    preferentialLines: 0,
    mfnLines: 1,
  },
  '870323': {
    productDescription: 'Spark-ignition vehicles, cylinder capacity > 1500cc and <= 3000cc',
    nomenclatureName: 'Harmonized System 2012',
    tariffType: 'MFN',
    simpleAverageRate: 10,
    minRate: 10,
    maxRate: 10,
    totalLines: 1,
    preferentialLines: 0,
    mfnLines: 1,
  },
  '847130': {
    productDescription: 'Portable automatic data processing machines',
    nomenclatureName: 'Harmonized System 2012',
    tariffType: 'MFN',
    simpleAverageRate: 0,
    minRate: 0,
    maxRate: 0,
    totalLines: 1,
    preferentialLines: 0,
    mfnLines: 1,
  },
};

const COUNTRY_CHARGE_RULES: Record<string, CountryChargeRule[]> = {
  TJK: [
    {
      code: 'mobile-import-duty',
      label: 'Mobile device import duty',
      kind: 'rate',
      rate: 20,
      note: 'Applied to mobile phone imports in Tajikistan from July 1, 2025.',
      applies: ({ hsCode }) => hsCode.startsWith('8517'),
    },
    {
      code: 'mobile-customs-fee',
      label: 'Mobile device customs fee',
      kind: 'fixed',
      fixedAmount: 10,
      currency: 'USD',
      note: 'USD 10 customs fee applies when mobile device customs value exceeds USD 100.',
      applies: ({ hsCode, customsValue, currency }) => hsCode.startsWith('8517') && currency === 'USD' && customsValue > 100,
    },
  ],
};

@Injectable()
export class TariffService {
  constructor(private readonly prisma: PrismaService) {}

  async quote(dto: TariffQuoteDto) {
    const destination = this.resolveDestinationCountry(dto.countryCode);
    const origin = this.resolveOriginCountry(dto.originCountryCode);
    const hsCode = this.normalizeHsCode(dto.hsCode);
    const cacheKey = this.buildCacheKey(destination.code, origin?.iso3, hsCode);
    const cached = await this.prisma.tariffRateCache.findUnique({ where: { cacheKey } });

    let availability: AvailabilityEntry | null = null;
    let partnerCode = '000';
    let tariff: TariffLookup;
    let cacheHit = false;

    if (cached && cached.expiresAt > new Date()) {
      cacheHit = true;
      tariff = this.mapCacheToTariff(cached);
      partnerCode = cached.partnerCode ?? '000';
    } else {
      try {
        availability = await this.fetchLatestAvailability(destination.reporterCode);
        partnerCode = this.resolvePartnerCode(availability.partnerCodes, origin?.reporterCode);
        tariff = await this.fetchTariffRate(destination.reporterCode, partnerCode, hsCode, availability.year);
      } catch {
        availability = {
          year: LOCAL_FALLBACK_YEAR,
          nomenclatureCode: 'H4',
          nomenclatureName: 'Harmonized System 2012',
          partnerCodes: ['000', '398', '840'],
          hasEstimatedSpecificDuty: true,
          lastUpdatedDate: null,
        };
        partnerCode = origin?.reporterCode && availability.partnerCodes.includes(origin.reporterCode) ? origin.reporterCode : '000';
        tariff = this.getLocalFallbackTariff(hsCode);
      }
      await this.upsertCache({
        cacheKey,
        hsCode,
        destinationCountryCode: destination.code,
        originCountryCode: origin?.iso3 ?? null,
        latestYear: availability.year,
        partnerCode,
        destination,
        availability,
        tariff,
      });
    }

    const year = cached && cacheHit ? cached.latestYear : availability?.year ?? new Date().getFullYear();
    const customsValue = this.resolveCustomsValue(dto);
    const currency = (dto.currency ?? 'USD').toUpperCase();
    const autoCharges = this.resolveCountrySpecificCharges({
      destinationCountryCode: destination.code,
      hsCode,
      customsValue,
      currency,
    });
    const additionalTaxLabel = autoCharges.length ? 'Country specific charges' : 'Additional tax';
    const additionalTaxRate =
      autoCharges.reduce((sum, item) => sum + (item.kind === 'rate' ? item.rate ?? 0 : 0), 0) || destination.defaultAdditionalTaxRate;
    const dutyAmount = this.roundTo2((customsValue * tariff.simpleAverageRate) / 100);
    const autoAdditionalTaxAmount = this.roundTo2(autoCharges.reduce((sum, item) => sum + item.amount, 0));
    const additionalTaxAmount = autoAdditionalTaxAmount;
    const vatBase = this.roundTo2(customsValue + dutyAmount + additionalTaxAmount);
    const vatAmount = this.roundTo2((vatBase * destination.vatRate) / 100);
    const totalTaxAmount = this.roundTo2(dutyAmount + additionalTaxAmount + vatAmount);
    const landedCost = this.roundTo2(customsValue + totalTaxAmount);
    const warnings = this.buildWarnings({
      dto,
      hsCode,
      destination,
      origin,
      year,
      partnerCode,
      cached,
      cacheHit,
    });

    const response: QuoteResponse = {
      country: {
        code: destination.code,
        name: destination.name,
      },
      originCountry: origin
        ? {
            code: origin.iso3,
            name: origin.name,
          }
        : null,
      hsCode,
      productDescription: tariff.productDescription,
      year,
      dataSource: {
        provider: 'WITS / UNCTAD TRAINS',
        pricing: 'free',
        reporterCode: destination.reporterCode,
        partnerCode,
        nomenclatureCode: cached && cacheHit ? cached.nomenclatureCode : availability?.nomenclatureCode ?? null,
        nomenclatureName:
          tariff.nomenclatureName ??
          (cached && cacheHit ? cached.nomenclatureName : availability?.nomenclatureName ?? null),
        lastUpdatedDate: cached && cacheHit ? cached.sourceLastUpdatedDate : availability?.lastUpdatedDate ?? null,
        cacheHit,
        cacheExpiresAt: cached?.expiresAt?.toISOString() ?? null,
      },
      tariff: {
        tariffType: tariff.tariffType,
        simpleAverageRate: tariff.simpleAverageRate,
        minRate: tariff.minRate,
        maxRate: tariff.maxRate,
        totalLines: tariff.totalLines,
        mfnLines: tariff.mfnLines,
        preferentialLines: tariff.preferentialLines,
      },
      calculation: {
        currency,
        invoiceValue: this.roundTo2(dto.invoiceValue ?? 0),
        freightCost: this.roundTo2(dto.freightCost ?? 0),
        insuranceCost: this.roundTo2(dto.insuranceCost ?? 0),
        customsValue,
        dutyRate: tariff.simpleAverageRate,
        dutyAmount,
        minDutyAmount: tariff.minRate === null ? null : this.roundTo2((customsValue * tariff.minRate) / 100),
        maxDutyAmount: tariff.maxRate === null ? null : this.roundTo2((customsValue * tariff.maxRate) / 100),
        vatRate: destination.vatRate,
        vatBase,
        vatAmount,
        additionalTaxLabel,
        additionalTaxRate,
        additionalTaxAmount,
        totalTaxAmount,
        landedCost,
        countrySpecificCharges: autoCharges,
      },
      warnings,
      nextFallbacks: [
        {
          provider: 'WITS API',
          pricing: 'free',
          note: 'Good for HS6 duty, import VAT, and landed-cost estimates.',
        },
        {
          provider: 'Commercial landed cost / tariff API',
          pricing: 'paid',
          note: 'Useful later for excise, restricted goods, and faster updates.',
        },
      ],
    };

    const history = await this.prisma.tariffQueryHistory.create({
      data: {
        destinationCountryCode: destination.code,
        destinationCountryName: destination.name,
        originCountryCode: origin?.iso3,
        originCountryName: origin?.name,
        hsCode,
        productDescription: tariff.productDescription,
        currency,
        invoiceValue: this.roundTo2(dto.invoiceValue ?? 0),
        freightCost: this.roundTo2(dto.freightCost ?? 0),
        insuranceCost: this.roundTo2(dto.insuranceCost ?? 0),
        customsValue,
        dutyRate: tariff.simpleAverageRate,
        dutyAmount,
        vatRate: destination.vatRate,
        vatBase,
        vatAmount,
        additionalTaxLabel,
        additionalTaxRate,
        additionalTaxAmount,
        totalTaxAmount,
        landedCost,
        queryYear: year,
        dataSource: 'WITS / UNCTAD TRAINS',
        partnerCode,
        cacheHit,
      },
    });

    response.id = history.id;
    return response;
  }

  async getHistory(query: PaginationQueryDto) {
    const where = query.keyword
      ? {
          OR: [
            { hsCode: { contains: query.keyword } },
            { destinationCountryName: { contains: query.keyword } },
            { originCountryName: { contains: query.keyword } },
            { productDescription: { contains: query.keyword } },
          ],
        }
      : undefined;

    const [items, total] = await Promise.all([
      this.prisma.tariffQueryHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.tariffQueryHistory.count({ where }),
    ]);

    return buildPagedResult(items, total, query.page, query.pageSize);
  }

  private buildWarnings({
    dto,
    hsCode,
    destination,
    origin,
    year,
    partnerCode,
    cached,
    cacheHit,
  }: {
    dto: TariffQuoteDto;
    hsCode: string;
    destination: SupportedCountry;
    origin: OriginCountry | null;
    year: number;
    partnerCode: string;
    cached: TariffRateCache | null;
    cacheHit: boolean;
  }) {
    const warnings: string[] = [];

    if (dto.hsCode.replace(/\D/g, '') !== hsCode) {
      warnings.push(`The source is queried at HS6 level, so ${hsCode} was used.`);
    }

    if (origin && partnerCode === '000') {
      warnings.push(`No dedicated partner rate was available for ${origin.name} in ${year}; using World/MFN.`);
    }

    if (year < new Date().getFullYear()) {
      warnings.push(`The latest Tajikistan tariff year available from WITS is ${year}.`);
    }

    warnings.push(`Import VAT is currently estimated at ${destination.vatRate}% on CIF + duty + additional tax.`);
    warnings.push('If the live WITS source is unavailable, the service falls back to local seeded tariff references for common HS codes.');

    if ((dto.additionalTaxRate ?? 0) === 0 && (dto.additionalTaxAmount ?? 0) === 0) {
      warnings.push('No country-specific additional charge rule matched this HS code, so additional charges remain 0.');
    }

    if (cacheHit && cached) {
      warnings.push(`Tariff cache hit. Cache expires on ${cached.expiresAt.toISOString().slice(0, 10)}.`);
    }

    return warnings;
  }

  private async upsertCache({
    cacheKey,
    hsCode,
    destinationCountryCode,
    originCountryCode,
    latestYear,
    partnerCode,
    destination,
    availability,
    tariff,
  }: {
    cacheKey: string;
    hsCode: string;
    destinationCountryCode: string;
    originCountryCode: string | null;
    latestYear: number;
    partnerCode: string;
    destination: SupportedCountry;
    availability: AvailabilityEntry;
    tariff: TariffLookup;
  }) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + CACHE_TTL_DAYS);

    await this.prisma.tariffRateCache.upsert({
      where: { cacheKey },
      update: {
        latestYear,
        productDescription: tariff.productDescription,
        sourceProvider: 'WITS / UNCTAD TRAINS',
        reporterCode: destination.reporterCode,
        partnerCode,
        nomenclatureCode: availability.nomenclatureCode,
        nomenclatureName: tariff.nomenclatureName ?? availability.nomenclatureName,
        sourceLastUpdatedDate: availability.lastUpdatedDate,
        tariffType: tariff.tariffType,
        simpleAverageRate: tariff.simpleAverageRate,
        minRate: tariff.minRate,
        maxRate: tariff.maxRate,
        totalLines: tariff.totalLines,
        mfnLines: tariff.mfnLines,
        preferentialLines: tariff.preferentialLines,
        vatRate: destination.vatRate,
        additionalTaxRate: destination.defaultAdditionalTaxRate,
        expiresAt,
      },
      create: {
        cacheKey,
        destinationCountryCode,
        originCountryCode: originCountryCode ?? undefined,
        hsCode,
        latestYear,
        productDescription: tariff.productDescription,
        sourceProvider: 'WITS / UNCTAD TRAINS',
        reporterCode: destination.reporterCode,
        partnerCode,
        nomenclatureCode: availability.nomenclatureCode,
        nomenclatureName: tariff.nomenclatureName ?? availability.nomenclatureName,
        sourceLastUpdatedDate: availability.lastUpdatedDate,
        tariffType: tariff.tariffType,
        simpleAverageRate: tariff.simpleAverageRate,
        minRate: tariff.minRate ?? undefined,
        maxRate: tariff.maxRate ?? undefined,
        totalLines: tariff.totalLines ?? undefined,
        mfnLines: tariff.mfnLines ?? undefined,
        preferentialLines: tariff.preferentialLines ?? undefined,
        vatRate: destination.vatRate,
        additionalTaxRate: destination.defaultAdditionalTaxRate,
        expiresAt,
      },
    });
  }

  private mapCacheToTariff(cached: TariffRateCache): TariffLookup {
    return {
      productDescription: cached.productDescription,
      nomenclatureName: cached.nomenclatureName,
      tariffType: cached.tariffType,
      simpleAverageRate: cached.simpleAverageRate,
      minRate: cached.minRate,
      maxRate: cached.maxRate,
      totalLines: cached.totalLines,
      preferentialLines: cached.preferentialLines,
      mfnLines: cached.mfnLines,
    };
  }

  private buildCacheKey(destinationCountryCode: string, originCountryCode: string | undefined, hsCode: string) {
    return [destinationCountryCode, originCountryCode ?? 'WORLD', hsCode].join(':');
  }

  private getLocalFallbackTariff(hsCode: string): TariffLookup {
    return (
      LOCAL_FALLBACK_TARIFFS[hsCode] ?? {
        productDescription: 'Generic Tajikistan fallback tariff sample',
        nomenclatureName: 'Harmonized System 2012',
        tariffType: 'MFN',
        simpleAverageRate: 5,
        minRate: 5,
        maxRate: 5,
        totalLines: 1,
        preferentialLines: 0,
        mfnLines: 1,
      }
    );
  }

  private resolveCountrySpecificCharges(input: {
    destinationCountryCode: string;
    hsCode: string;
    customsValue: number;
    currency: string;
  }) {
    const rules = COUNTRY_CHARGE_RULES[input.destinationCountryCode] ?? [];
    return rules
      .filter((rule) => rule.applies(input))
      .map((rule) => {
        const amount =
          rule.kind === 'rate'
            ? this.roundTo2((input.customsValue * (rule.rate ?? 0)) / 100)
            : this.roundTo2(rule.fixedAmount ?? 0);

        return {
          code: rule.code,
          label: rule.label,
          kind: rule.kind,
          rate: rule.rate ?? null,
          amount,
          note: rule.note,
        };
      });
  }

  private resolveDestinationCountry(input: string) {
    const normalized = this.normalizeToken(input);
    const country = SUPPORTED_COUNTRIES.find((item) => item.aliases.some((alias) => this.normalizeToken(alias) === normalized));
    if (!country) {
      throw new BadRequestException('This version currently supports Tajikistan only.');
    }
    return country;
  }

  private resolveOriginCountry(input?: string) {
    if (!input) {
      return null;
    }

    const normalized = this.normalizeToken(input);
    return KNOWN_ORIGINS.find((item) => item.aliases.some((alias) => this.normalizeToken(alias) === normalized)) ?? null;
  }

  private normalizeHsCode(hsCode: string) {
    const digits = hsCode.replace(/\D/g, '');
    if (digits.length < 6) {
      throw new BadRequestException('Please provide at least 6 digits of HS code.');
    }
    return digits.slice(0, 6);
  }

  private normalizeToken(value: string) {
    return value.trim().toUpperCase();
  }

  private resolveCustomsValue(dto: TariffQuoteDto) {
    if (dto.customsValue !== undefined) {
      return this.roundTo2(dto.customsValue);
    }

    const invoiceValue = dto.invoiceValue ?? 0;
    const freightCost = dto.freightCost ?? 0;
    const insuranceCost = dto.insuranceCost ?? 0;
    return this.roundTo2(invoiceValue + freightCost + insuranceCost);
  }

  private resolvePartnerCode(availablePartnerCodes: string[], preferredPartnerCode?: string) {
    if (preferredPartnerCode && availablePartnerCodes.includes(preferredPartnerCode)) {
      return preferredPartnerCode;
    }
    return '000';
  }

  private async fetchLatestAvailability(reporterCode: string): Promise<AvailabilityEntry> {
    const xml = await this.fetchText(`https://wits.worldbank.org/API/V1/wits/datasource/trn/dataavailability/country/${reporterCode}/year/all`);
    const blocks = xml.match(/<wits:reporter\b[\s\S]*?<\/wits:reporter>/g) ?? [];
    const items = blocks
      .map((block) => ({
        year: Number(this.extractTag(block, 'year') ?? 0),
        nomenclatureCode: this.extractAttribute(block, 'reporternernomenclature', 'reporternernomenclaturecode'),
        nomenclatureName: this.extractTag(block, 'reporternernomenclature'),
        partnerCodes: (this.extractTag(block, 'partnerlist') ?? '')
          .split(';')
          .map((item) => item.trim())
          .filter(Boolean),
        hasEstimatedSpecificDuty: (this.extractTag(block, 'isspecificdutyexpressionestimatedavailable') ?? '').toLowerCase() === 'yes',
        lastUpdatedDate: this.extractTag(block, 'lastupdateddate'),
      }))
      .filter((item) => item.year > 0)
      .sort((a, b) => b.year - a.year);

    if (!items.length) {
      throw new BadGatewayException('Unable to read Tajikistan data availability from WITS.');
    }

    return items[0];
  }

  private async fetchTariffRate(reporterCode: string, partnerCode: string, hsCode: string, year: number): Promise<TariffLookup> {
    const url = `https://wits.worldbank.org/API/V1/SDMX/V21/datasource/TRN/reporter/${reporterCode}/partner/${partnerCode}/product/${hsCode}/year/${year}/datatype/reported?format=JSON`;
    const payload = await this.fetchJson<any>(url);
    const dataSet = payload?.dataSets?.[0] as { series?: Record<string, { observations?: Record<string, unknown[]> }> } | undefined;
    const series = dataSet?.series ? (Object.values(dataSet.series)[0] as { observations?: Record<string, unknown[]> } | undefined) : undefined;
    const observation = series?.observations ? Object.values(series.observations)[0] : null;

    if (!Array.isArray(observation) || observation[0] === null || observation[0] === undefined) {
      throw new BadGatewayException(`WITS did not return tariff data for HS ${hsCode} in ${year}.`);
    }

    const seriesDimensions = payload?.structure?.dimensions?.series ?? [];
    const observationAttributes = payload?.structure?.attributes?.observation ?? [];

    return {
      productDescription: this.readDimensionValue(seriesDimensions, 'PRODUCTCODE'),
      nomenclatureName: this.readAttributeValue(observationAttributes, 'NOMENCODE'),
      tariffType: this.readAttributeValue(observationAttributes, 'TARIFFTYPE'),
      simpleAverageRate: Number(observation[0]),
      minRate: this.readNumberAttribute(observationAttributes, 'MIN_RATE'),
      maxRate: this.readNumberAttribute(observationAttributes, 'MAX_RATE'),
      totalLines: this.readNumberAttribute(observationAttributes, 'TOTALNOOFLINES'),
      preferentialLines: this.readNumberAttribute(observationAttributes, 'NBR_PREF_LINES'),
      mfnLines: this.readNumberAttribute(observationAttributes, 'NBR_MFN_LINES'),
    };
  }

  private readDimensionValue(dimensions: Array<{ id?: string; values?: Array<{ id?: string; name?: string }> }>, id: string) {
    const entry = dimensions.find((item) => item.id === id);
    const value = entry?.values?.[0];
    return value?.name ?? value?.id ?? null;
  }

  private readAttributeValue(attributes: Array<{ id?: string; values?: Array<{ id?: string; name?: string }> }>, id: string) {
    const entry = attributes.find((item) => item.id === id);
    const value = entry?.values?.[0];
    return value?.name ?? value?.id ?? null;
  }

  private readNumberAttribute(attributes: Array<{ id?: string; values?: Array<{ id?: string; name?: string }> }>, id: string) {
    const raw = this.readAttributeValue(attributes, id);
    if (raw === null || raw === '') {
      return null;
    }
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  }

  private extractTag(block: string, tagName: string) {
    const match = block.match(new RegExp(`<wits:${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/wits:${tagName}>`, 'i'));
    return match?.[1]?.trim() || null;
  }

  private extractAttribute(block: string, tagName: string, attributeName: string) {
    const match = block.match(new RegExp(`<wits:${tagName}\\s[^>]*${attributeName}="([^"]+)"`, 'i'));
    return match?.[1] ?? null;
  }

  private async fetchText(url: string) {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/xml, text/xml, application/json',
      },
    });

    if (!response.ok) {
      throw new BadGatewayException(`WITS request failed with status ${response.status}.`);
    }

    return response.text();
  }

  private async fetchJson<T>(url: string): Promise<T> {
    const text = await this.fetchText(url);
    try {
      return JSON.parse(text.replace(/^\uFEFF/, '')) as T;
    } catch {
      throw new BadGatewayException('WITS returned a payload that could not be parsed.');
    }
  }

  private roundTo2(value: number) {
    return Number(value.toFixed(2));
  }
}
