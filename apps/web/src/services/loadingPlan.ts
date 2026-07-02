export type CargoItem = {
  id: string;
  boxNo: string;
  name: string;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  quantity: number;
  weightKg: number;
  totalWeightKg: number;
  volumeCbm: number;
  allowRotate: boolean;
  allowStack: boolean;
  remark?: string;
};

export type LoadingVehicle = {
  id: string;
  sequenceNo: number;
  category: string;
  name: string;
  lineCount?: number | null;
  axleCount?: number | null;
  effectiveLength?: number | null;
  effectiveWidth?: number | null;
  effectiveHeight?: number | null;
  effectiveVolume?: number | null;
  payloadWeight?: number | null;
  tareWeight?: number | null;
  isClosed?: boolean | number | null;
  priceSort?: number | null;
  priceWeight?: number | null;
  scenario?: string | null;
};

export type LoadingAssignment = {
  id: string;
  vehicleId: string;
  vehicleName: string;
  cargoId: string;
  cargoName: string;
  boxNo: string;
  quantity: number;
  usedLengthCm: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  weightKg: number;
  volumeCbm: number;
  allowRotate?: boolean;
  allowStack?: boolean;
  remark?: string;
  notes: string[];
};

export type LoadingVehicleResult = {
  vehicle: LoadingVehicle;
  loadingMethod: string;
  assignments: LoadingAssignment[];
  usedWeightKg: number;
  usedVolumeCbm: number;
  maxLengthCm: number;
  weightUtilization: number;
  volumeUtilization: number;
  warnings: string[];
};

export type UnassignedCargo = {
  cargo: CargoItem;
  quantity: number;
  reasons: string[];
};

export type LoadingPlan = {
  id: string;
  title: string;
  createdAt: string;
  vehicles: LoadingVehicleResult[];
  unassigned: UnassignedCargo[];
  summary: {
    totalCargoQuantity: number;
    assignedQuantity: number;
    totalWeightKg: number;
    assignedWeightKg: number;
    totalVolumeCbm: number;
    assignedVolumeCbm: number;
    vehicleCount: number;
  };
  notes: string[];
};

export type LoadingPlanOptions = {
  title?: string;
  destinationCountry?: string;
  destinationCountries?: string[];
  loadingStrategy?: 'quoteSafe' | 'executionOptimized';
  vehiclePreference?: 'default' | 'lowestPriceWeight' | 'maxCapacity' | 'maxClearance' | 'flatbedFirst' | 'tarpFirst';
  loadingRules?: LoadingRuleOverride[];
};

export type LoadingRuleOverride = {
  ruleCode: string;
  ruleValue: string | number | boolean;
  valueType?: 'number' | 'text' | 'boolean' | 'json';
  enabled?: boolean;
  applicableCountries?: string[];
};

type CargoUnit = CargoItem & {
  unitId: string;
  sourceId: string;
};

type WorkBin = {
  vehicle: LoadingVehicle;
  method: string;
  items: CargoUnit[];
  warnings: string[];
};

export const loadingRules = {
  flatbedWeightLimitKg: 31_000,
  indivisibleSingleVehicleKg: 44_000,
  oversizeWidthMm: 3_000,
  oversizeHeightMm: 4_500,
  projectBatchMinItems: 60,
  projectBatchSlashRatio: 0.45,
  tarpNarrowWidthMm: 1_100,
  tarpLowHeightMm: 900,
  tarpLongLengthMm: 9_000,
  oversizeCandidateWidthMm: 2_500,
  oversizeSoftVolumeCbm: 200,
  flatbedSoftWidthMm: 2_700,
  flatbedDeckWidthMm: 2_500,
  flatbedCostPlanLengthMm: 17_000,
  mediumFlatbedSeedWeightKg: 12_000,
  russiaMaxVehicleCargoHeightMm: 5_200,
  russiaCargoHeightLimitMm: 4_200,
  deckPressureLimitKgPerMm: 4,
  rotatedLoadMaxWidthMm: 3_500,
  multiCargoHardSplitWeightKg: 44_000,
  multiCargoRiskSplitWeightKg: 42_000,
  russiaBatchMinItems: 40,
  russiaFlatbedRequiredWidthMm: 2_500,
  russiaTarpPreferredWidthMm: 2_450,
  russiaHighCargoMm: 3_300,
  automotiveBatchMinItems: 300,
  automotivePlanLengthMm: 17_200,
  automotiveWideLinearWidthMm: 3_400,
  automotiveFlatbedGroupMaxWeightKg: 33_000,
  automotiveOversizeGroupMaxWeightKg: 90_000,
  mixedLongProjectMinItems: 30,
  mixedLongProjectMaxItems: 80,
  mixedLongAnchorMinLengthMm: 9_000,
  mixedLongCarrierMaxLengthMm: 18_500,
  mixedBulkOversizeMaxWeightKg: 70_000,
  russiaIndustrialMinItems: 10,
  russiaIndustrialWideWidthMm: 3_000,
  russiaIndustrialWideHeightMm: 3_300,
  russiaIndustrialTarpMaxWeightKg: 27_000,
  russiaHighWideFlatbedWidthMm: 3_100,
  russiaHighWideFlatbedHeightMm: 3_200,
  russiaTarpPreferredMaxWidthMm: 2_500,
  russiaTarpPreferredMaxHeightMm: 2_500,
  russiaTarpHardReviewWidthMm: 3_300,
  russiaTarpSideBySideReviewWidthMm: 3_300,
  russiaLongCargoMinLengthMm: 24_000,
  russiaLongCargoTargetWidthMm: 3_000,
  russiaLongCargoMaxGroupWeightKg: 70_000,
  pipeBatchMinQuantity: 30,
  pipeBatchQuoteSafeMaxWeightKg: 30_800,
  pipeBatchTarpSafeMaxWeightKg: 19_000,
  pipeBatchLargeDiameterMm: 900,
};

type LoadingRules = typeof loadingRules;

let activeLoadingRules: LoadingRules = loadingRules;

function resolveLoadingRules(overrides?: LoadingRuleOverride[]): LoadingRules {
  const next: LoadingRules = { ...loadingRules };
  for (const override of overrides ?? []) {
    if (override.enabled === false || !(override.ruleCode in next)) {
      continue;
    }
    const key = override.ruleCode as keyof LoadingRules;
    const rawValue = override.ruleValue;
    const defaultValue = next[key];
    if (typeof defaultValue === 'number') {
      const parsed = Number(rawValue);
      if (Number.isFinite(parsed)) {
        next[key] = parsed as LoadingRules[typeof key];
      }
    }
  }
  return next;
}

function positive(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function includesAny(text: string, tokens: string[]) {
  return tokens.some((token) => text.includes(token));
}

function vehicleText(vehicle: LoadingVehicle) {
  return `${vehicle.category} ${vehicle.name} ${vehicle.scenario ?? ''}`;
}

function isFlatbedVehicle(vehicle: LoadingVehicle) {
  return includesAny(vehicleText(vehicle), ['平板']);
}

function isTarpVehicle(vehicle: LoadingVehicle) {
  return includesAny(vehicleText(vehicle), ['蓬布', '篷布']);
}

function isOversizeVehicle(vehicle: LoadingVehicle) {
  return includesAny(vehicleText(vehicle), ['超限', '特种', '抽拉', '超低', '塔筒', '叶片', '轴线', '拼接']);
}

function isSpecialDeckVehicle(vehicle: LoadingVehicle) {
  return isOversizeVehicle(vehicle) || includesAny(vehicleText(vehicle), ['特种板']);
}

function vehiclePayloadLimit(vehicle: LoadingVehicle) {
  if (isFlatbedVehicle(vehicle)) {
    return activeLoadingRules.flatbedWeightLimitKg;
  }
  return positive(vehicle.payloadWeight);
}

function vehiclePriceSort(vehicle: LoadingVehicle) {
  const value = Number(vehicle.priceWeight ?? vehicle.priceSort);
  return Number.isFinite(value) && value > 0 ? value : 999_999;
}

function vehiclePreferenceRank(vehicle: LoadingVehicle, preference: LoadingPlanOptions['vehiclePreference']) {
  if (preference === 'flatbedFirst') {
    return isFlatbedVehicle(vehicle) ? 0 : isOversizeVehicle(vehicle) ? 1 : isTarpVehicle(vehicle) ? 2 : 3;
  }
  if (preference === 'tarpFirst') {
    return isTarpVehicle(vehicle) ? 0 : isFlatbedVehicle(vehicle) ? 1 : isOversizeVehicle(vehicle) ? 2 : 3;
  }
  return 0;
}

function prepareVehiclesForStrategy(vehicles: LoadingVehicle[], options: LoadingPlanOptions) {
  const preference = options.vehiclePreference ?? 'default';
  return [...vehicles].sort((a, b) => {
    const preferenceScore = vehiclePreferenceRank(a, preference) - vehiclePreferenceRank(b, preference);
    if (preferenceScore) return preferenceScore;
    if (preference === 'maxCapacity') {
      return (
        vehiclePayloadLimit(b) - vehiclePayloadLimit(a) ||
        positive(b.effectiveVolume) - positive(a.effectiveVolume) ||
        vehiclePriceSort(a) - vehiclePriceSort(b)
      );
    }
    if (preference === 'maxClearance') {
      return (
        positive(b.effectiveLength) - positive(a.effectiveLength) ||
        positive(b.effectiveWidth) - positive(a.effectiveWidth) ||
        positive(b.effectiveHeight) - positive(a.effectiveHeight) ||
        positive(b.effectiveVolume) - positive(a.effectiveVolume) ||
        vehiclePayloadLimit(b) - vehiclePayloadLimit(a) ||
        vehiclePriceSort(a) - vehiclePriceSort(b)
      );
    }
    if (preference === 'lowestPriceWeight') {
      return (
        vehiclePriceSort(a) - vehiclePriceSort(b) ||
        vehiclePayloadLimit(b) - vehiclePayloadLimit(a) ||
        positive(b.effectiveVolume) - positive(a.effectiveVolume)
      );
    }
    return vehiclePriceSort(a) - vehiclePriceSort(b) || vehiclePayloadLimit(b) - vehiclePayloadLimit(a);
  });
}

function vehicleLengthMm(vehicle: LoadingVehicle) {
  const value = positive(vehicle.effectiveLength);
  if (!value) {
    return 0;
  }
  return value <= 80 ? value * 1000 : value;
}

function vehicleWidthMm(vehicle: LoadingVehicle) {
  const value = positive(vehicle.effectiveWidth);
  return value <= 20 ? value * 1000 : value;
}

function vehicleHeightMm(vehicle: LoadingVehicle) {
  const value = positive(vehicle.effectiveHeight);
  return value <= 20 ? value * 1000 : value;
}

function shouldRotateForPlacement(cargo: CargoItem) {
  if (!cargo.allowRotate) {
    return false;
  }
  const longSide = Math.max(cargo.lengthCm, cargo.widthCm);
  const shortSide = Math.min(cargo.lengthCm, cargo.widthCm);
  return longSide !== shortSide && longSide <= activeLoadingRules.rotatedLoadMaxWidthMm;
}

function placementLengthMm(cargo: CargoItem) {
  return shouldRotateForPlacement(cargo) ? Math.min(cargo.lengthCm, cargo.widthCm) : cargo.lengthCm;
}

function placementWidthMm(cargo: CargoItem) {
  return shouldRotateForPlacement(cargo) ? Math.max(cargo.lengthCm, cargo.widthCm) : cargo.widthCm;
}

function cargoUnitVolume(cargo: CargoItem) {
  return (cargo.lengthCm * cargo.widthCm * cargo.heightCm) / 1_000_000_000;
}

function cargoVolume(cargo: CargoItem) {
  return positive(cargo.volumeCbm) || cargoUnitVolume(cargo) * cargo.quantity;
}

function cargoKeywords(cargo: CargoItem) {
  return `${cargo.name} ${cargo.remark ?? ''}`.toLowerCase();
}

function cargoRemarkText(cargo: CargoItem) {
  return `${cargo.name} ${cargo.remark ?? ''}`;
}

function cannotBePressed(cargo: CargoItem) {
  return includesAny(cargoRemarkText(cargo), ['不能压', '不能叠', '不可叠', '不可摆放', '不能摆放']);
}

function canBeUpperCargo(cargo: CargoItem) {
  return cargo.allowStack || includesAny(cargoRemarkText(cargo), ['可以上高', '可上高', '可叠放', '可叠', '上面可以压轻货']);
}

function isPipeCargo(cargo: CargoItem) {
  const text = cargoRemarkText(cargo).toLowerCase();
  return (
    includesAny(text, ['管', 'pipe', 'tube']) &&
    cargo.lengthCm >= 3_000 &&
    cargo.widthCm >= 200 &&
    cargo.widthCm <= 2_000 &&
    Math.abs(cargo.widthCm - cargo.heightCm) <= Math.max(120, Math.min(cargo.widthCm, cargo.heightCm) * 0.25)
  );
}

function isPipeBatch(pool: CargoUnit[]) {
  if (pool.length < activeLoadingRules.pipeBatchMinQuantity) {
    return false;
  }
  const pipeCount = pool.filter(isPipeCargo).length;
  return pipeCount / pool.length >= 0.8;
}

function isSmallFillerCargo(cargo: CargoItem) {
  return cargo.weightKg <= 1_600 && cargo.lengthCm <= 6_500 && cargo.widthCm <= 1_700 && cargo.heightCm <= 1_800;
}

function isLongFlatbedCargo(cargo: CargoItem) {
  return cargo.lengthCm >= 13_500 && cargo.widthCm <= 1_500 && cargo.weightKg <= activeLoadingRules.flatbedWeightLimitKg;
}

function isStackableLargeCargo(cargo: CargoItem) {
  return (
    cargo.allowStack &&
    cargo.lengthCm >= 2_000 &&
    cargo.widthCm <= 1_100 &&
    cargo.weightKg >= 2_000 &&
    cargo.weightKg <= activeLoadingRules.flatbedWeightLimitKg
  );
}

function flatbedCanCarryGroup(items: CargoItem[]) {
  if (items.some(requiresSpecialDeck)) {
    return false;
  }
  if (items.length > 1 && sumWeight(items) >= activeLoadingRules.multiCargoHardSplitWeightKg) {
    return false;
  }
  return sumWeight(items) <= activeLoadingRules.flatbedWeightLimitKg && items.every((item) => item.weightKg <= activeLoadingRules.flatbedWeightLimitKg);
}

function floorPlanLengthMm(items: CargoItem[], usableWidthMm = activeLoadingRules.flatbedDeckWidthMm) {
  const areaLength = items.reduce((sum, item) => sum + placementLengthMm(item) * placementWidthMm(item), 0) / usableWidthMm;
  return Math.max(maxLength(items), areaLength);
}

function canFlatbedCostGroup(items: CargoItem[]) {
  return (
    flatbedCanCarryGroup(items) &&
    maxWidth(items) <= activeLoadingRules.flatbedSoftWidthMm &&
    floorPlanLengthMm(items) <= activeLoadingRules.flatbedCostPlanLengthMm
  );
}

function isMediumFlatbedSeed(cargo: CargoItem) {
  return (
    cargo.weightKg >= activeLoadingRules.mediumFlatbedSeedWeightKg &&
    cargo.weightKg <= activeLoadingRules.flatbedWeightLimitKg &&
    placementWidthMm(cargo) <= activeLoadingRules.flatbedSoftWidthMm &&
    placementLengthMm(cargo) <= activeLoadingRules.flatbedCostPlanLengthMm
  );
}

function vehicleMatchScore(vehicle: LoadingVehicle, cargo: CargoItem) {
  const text = cargoKeywords(cargo);
  const scenario = vehicleText(vehicle).toLowerCase();
  let score = 0;
  for (const token of text.split(/\s+/).filter(Boolean)) {
    if (token.length > 1 && scenario.includes(token)) {
      score += 2;
    }
  }
  if (text.includes('冷') && scenario.includes('冷')) {
    score += 6;
  }
  if ((text.includes('超限') || text.includes('大件')) && scenario.includes('超')) {
    score += 4;
  }
  return score;
}

function expandCargo(cargoItems: CargoItem[]) {
  return cargoItems.flatMap((cargo) =>
    Array.from({ length: Math.max(1, Math.round(cargo.quantity)) }, (_, index): CargoUnit => ({
      ...cargo,
      unitId: `${cargo.id}_${index + 1}`,
      sourceId: cargo.id,
      quantity: 1,
      totalWeightKg: cargo.weightKg,
      volumeCbm: cargoUnitVolume(cargo),
    })),
  );
}

function sumWeight(items: CargoItem[]) {
  return items.reduce((sum, item) => sum + item.weightKg, 0);
}

function sumVolume(items: CargoItem[]) {
  return items.reduce((sum, item) => sum + cargoVolume(item), 0);
}

function maxLength(items: CargoItem[]) {
  return items.reduce((max, item) => Math.max(max, placementLengthMm(item)), 0);
}

function maxWidth(items: CargoItem[]) {
  return items.reduce((max, item) => Math.max(max, placementWidthMm(item)), 0);
}

function hasOversizeDimension(cargo: CargoItem) {
  return (
    placementWidthMm(cargo) > activeLoadingRules.oversizeWidthMm ||
    cargo.heightCm > activeLoadingRules.oversizeHeightMm ||
    cargo.lengthCm > 13_600
  );
}

function isHeavyForFlatbed(cargo: CargoItem) {
  return cargo.weightKg > activeLoadingRules.flatbedWeightLimitKg;
}

function deckPressureKgPerMm(cargo: CargoItem) {
  const supportLength = Math.max(placementLengthMm(cargo), cargo.lengthCm, 1);
  return cargo.weightKg / supportLength;
}

function requiresSpecialDeck(cargo: CargoItem) {
  return deckPressureKgPerMm(cargo) > activeLoadingRules.deckPressureLimitKgPerMm;
}

function shouldPreferOversize(cargo: CargoItem) {
  return (
    requiresSpecialDeck(cargo) ||
    isHeavyForFlatbed(cargo) ||
    placementWidthMm(cargo) >= activeLoadingRules.oversizeWidthMm ||
    cargo.heightCm >= 3_800 ||
    (placementWidthMm(cargo) >= activeLoadingRules.oversizeCandidateWidthMm && cargo.weightKg >= activeLoadingRules.flatbedWeightLimitKg)
  );
}

function requiresSingleVehicle(cargo: CargoItem) {
  return cargo.weightKg > activeLoadingRules.indivisibleSingleVehicleKg;
}

function isLongLowTarpCargo(cargo: CargoItem) {
  return (
    cargo.lengthCm >= activeLoadingRules.tarpLongLengthMm &&
    cargo.widthCm <= activeLoadingRules.tarpNarrowWidthMm &&
    cargo.heightCm <= activeLoadingRules.tarpLowHeightMm &&
    cargo.weightKg <= activeLoadingRules.flatbedWeightLimitKg
  );
}

function chooseVehicle(vehicles: LoadingVehicle[], predicate: (vehicle: LoadingVehicle) => boolean, requiredWeight: number) {
  const candidates = vehicles
    .filter(predicate)
    .filter((vehicle) => vehiclePayloadLimit(vehicle) >= requiredWeight)
    .sort(
      (a, b) =>
        vehiclePriceSort(a) - vehiclePriceSort(b) ||
        vehiclePayloadLimit(a) - vehiclePayloadLimit(b) ||
        positive(a.effectiveVolume) - positive(b.effectiveVolume),
    );
  return candidates[0] ?? vehicles.filter(predicate).sort((a, b) => vehiclePriceSort(a) - vehiclePriceSort(b) || vehiclePayloadLimit(b) - vehiclePayloadLimit(a))[0] ?? null;
}

function chooseProjectFlatbed(vehicles: LoadingVehicle[]) {
  return (
    vehicles
      .filter(isFlatbedVehicle)
      .sort((a, b) => {
        const aScore = Number(vehicleText(a).includes('17')) * 10 + Number(a.lineCount === 5) * 5 - Math.abs(vehicleLengthMm(a) - 16_500) / 1000;
        const bScore = Number(vehicleText(b).includes('17')) * 10 + Number(b.lineCount === 5) * 5 - Math.abs(vehicleLengthMm(b) - 16_500) / 1000;
        return bScore - aScore || vehiclePriceSort(a) - vehiclePriceSort(b);
      })[0] ?? null
  );
}

function chooseProjectTarp(vehicles: LoadingVehicle[]) {
  return vehicles.filter(isTarpVehicle).sort((a, b) => vehiclePriceSort(a) - vehiclePriceSort(b) || vehiclePayloadLimit(b) - vehiclePayloadLimit(a))[0] ?? chooseProjectFlatbed(vehicles);
}

function destinationCountries(options: LoadingPlanOptions) {
  return options.destinationCountries?.length ? options.destinationCountries : options.destinationCountry ? [options.destinationCountry] : [];
}

function rawVehiclePayload(vehicle: LoadingVehicle) {
  return positive(vehicle.payloadWeight) || vehiclePayloadLimit(vehicle);
}

function chooseAutomotiveFlatbed(vehicles: LoadingVehicle[], requiredWeight: number, widthMm: number) {
  const targetAxle = requiredWeight > activeLoadingRules.flatbedWeightLimitKg || widthMm >= 2_900 ? 7 : requiredWeight > 26_000 || widthMm >= 2_700 ? 6 : 5;
  const candidates = vehicles
    .filter(isFlatbedVehicle)
    .filter((vehicle) => rawVehiclePayload(vehicle) >= Math.min(requiredWeight, activeLoadingRules.automotiveFlatbedGroupMaxWeightKg))
    .sort((a, b) => {
      const aAxle = positive(a.axleCount ?? a.lineCount);
      const bAxle = positive(b.axleCount ?? b.lineCount);
      return Math.abs(aAxle - targetAxle) - Math.abs(bAxle - targetAxle) || vehiclePriceSort(a) - vehiclePriceSort(b) || rawVehiclePayload(a) - rawVehiclePayload(b);
    });
  return candidates[0] ?? chooseProjectFlatbed(vehicles);
}

function chooseAutomotiveTarp(vehicles: LoadingVehicle[], requiredWeight: number) {
  const tarps = vehicles
    .filter(isTarpVehicle)
    .filter((vehicle) => rawVehiclePayload(vehicle) >= requiredWeight)
    .sort((a, b) => vehiclePriceSort(a) - vehiclePriceSort(b) || rawVehiclePayload(a) - rawVehiclePayload(b));
  return tarps[0] ?? chooseProjectTarp(vehicles);
}

function chooseAxleTarp(vehicles: LoadingVehicle[], requiredWeight: number, targetAxle = 6) {
  const tarps = vehicles
    .filter(isTarpVehicle)
    .filter((vehicle) => rawVehiclePayload(vehicle) >= requiredWeight)
    .sort((a, b) => {
      const aAxle = positive(a.axleCount ?? a.lineCount);
      const bAxle = positive(b.axleCount ?? b.lineCount);
      return Math.abs(aAxle - targetAxle) - Math.abs(bAxle - targetAxle) || vehiclePriceSort(a) - vehiclePriceSort(b) || rawVehiclePayload(a) - rawVehiclePayload(b);
    });
  return tarps[0] ?? chooseAutomotiveTarp(vehicles, requiredWeight);
}

function chooseAxleFlatbed(vehicles: LoadingVehicle[], requiredWeight: number, targetAxle = 6) {
  const flatbeds = vehicles
    .filter(isFlatbedVehicle)
    .filter((vehicle) => rawVehiclePayload(vehicle) >= requiredWeight)
    .sort((a, b) => {
      const aAxle = positive(a.axleCount ?? a.lineCount);
      const bAxle = positive(b.axleCount ?? b.lineCount);
      return Math.abs(aAxle - targetAxle) - Math.abs(bAxle - targetAxle) || vehiclePriceSort(a) - vehiclePriceSort(b) || rawVehiclePayload(a) - rawVehiclePayload(b);
    });
  return flatbeds[0] ?? chooseAutomotiveFlatbed(vehicles, requiredWeight, 0);
}

function chooseAutomotiveOversize(vehicles: LoadingVehicle[], requiredWeight: number, widthMm: number, heightMm: number) {
  const oversizeVehicles = vehicles
    .filter(isOversizeVehicle)
    .filter((vehicle) => rawVehiclePayload(vehicle) >= requiredWeight)
    .sort((a, b) => {
      const aText = vehicleText(a);
      const bText = vehicleText(b);
      const aScore = Number(widthMm >= 3_600 && includesAny(aText, ['超低', '特种', '拼接'])) * 20 + Number(heightMm >= 3_600 && includesAny(aText, ['超低', '轴线'])) * 12;
      const bScore = Number(widthMm >= 3_600 && includesAny(bText, ['超低', '特种', '拼接'])) * 20 + Number(heightMm >= 3_600 && includesAny(bText, ['超低', '轴线'])) * 12;
      return bScore - aScore || vehiclePriceSort(a) - vehiclePriceSort(b) || rawVehiclePayload(a) - rawVehiclePayload(b);
    });
  return oversizeVehicles[0] ?? chooseAutomotiveFlatbed(vehicles, requiredWeight, widthMm);
}

function isRussiaDestination(options: LoadingPlanOptions) {
  return destinationCountries(options).some((country) => country.includes('俄罗斯'));
}

function isUzbekistanDestination(options: LoadingPlanOptions) {
  return destinationCountries(options).some((country) => country.includes('乌兹') || country.toLowerCase().includes('uzbek'));
}

function boxNumber(value: string) {
  const match = value.match(/^(\d+)(?:\/\d+)?$/);
  return match ? Number(match[1]) : null;
}

function hasSlashSeries(cargo: CargoItem) {
  return /\/\d+$/.test(cargo.boxNo);
}

function numberIn(cargo: CargoItem, values: number[]) {
  const number = boxNumber(cargo.boxNo);
  return number !== null && values.includes(number);
}

function numberRange(cargo: CargoItem, start: number, end: number, slashOnly: boolean | null = null) {
  const number = boxNumber(cargo.boxNo);
  if (number === null || number < start || number > end) return false;
  if (slashOnly === true) return hasSlashSeries(cargo);
  if (slashOnly === false) return !hasSlashSeries(cargo);
  return true;
}

function isProjectBatch(pool: CargoUnit[]) {
  if (pool.length < activeLoadingRules.projectBatchMinItems) return false;
  const slashCount = pool.filter(hasSlashSeries).length;
  return slashCount / pool.length >= activeLoadingRules.projectBatchSlashRatio && pool.every((item) => item.weightKg <= activeLoadingRules.flatbedWeightLimitKg);
}

function isAutomotiveBatch(pool: CargoUnit[]) {
  if (pool.length < activeLoadingRules.automotiveBatchMinItems || pool.some(hasSlashSeries)) return false;
  const regularPieces = pool.filter((item) => item.lengthCm <= 18_000 && item.widthCm <= 4_800 && item.heightCm <= 4_500);
  const mediumWidePieces = pool.filter((item) => item.widthCm >= 2_200 && item.widthCm <= 3_100).length;
  return regularPieces.length / pool.length >= 0.9 && mediumWidePieces / pool.length >= 0.25;
}

function automotivePackedLengthMm(items: CargoItem[]) {
  const width = maxWidth(items);
  if (width >= activeLoadingRules.automotiveWideLinearWidthMm) {
    return items.reduce((sum, item) => sum + placementLengthMm(item), 0);
  }
  const usableWidth = width >= 2_850 ? 3_000 : width >= 2_450 ? 2_800 : 2_450;
  return floorPlanLengthMm(items, usableWidth);
}

function automotiveWidthBand(cargo: CargoItem) {
  if (cargo.widthCm >= 3_400) return 'extra-wide';
  if (cargo.widthCm >= 3_000 || cargo.heightCm >= 3_400) return 'wide-high';
  if (cargo.widthCm >= 2_700) return 'wide';
  if (cargo.widthCm >= 2_450) return 'medium-wide';
  if (cargo.widthCm >= 2_200) return 'medium';
  return 'normal';
}

function canAddToAutomotiveBin(bin: CargoItem[], cargo: CargoItem, maxItems: number, maxWeightKg: number, maxLengthMm: number) {
  const next = [...bin, cargo];
  return next.length <= maxItems && sumWeight(next) <= maxWeightKg && automotivePackedLengthMm(next) <= maxLengthMm;
}

function buildAutomotiveBatchBins(pool: CargoUnit[], vehicles: LoadingVehicle[]) {
  if (!isAutomotiveBatch(pool)) {
    return { bins: [] as WorkBin[], rest: pool };
  }

  const bins: WorkBin[] = [];
  let rest = [...pool].sort((a, b) => b.widthCm - a.widthCm || b.heightCm - a.heightCm || b.weightKg - a.weightKg);
  const maxLength = activeLoadingRules.automotivePlanLengthMm;

  const groupConfigs: Record<string, { maxItems: number; maxWeightKg: number; preferTarp: boolean; method: string }> = {
    'extra-wide': {
      maxItems: 4,
      maxWeightKg: activeLoadingRules.automotiveOversizeGroupMaxWeightKg,
      preferTarp: false,
      method: '汽车件超宽线性排布',
    },
    'wide-high': {
      maxItems: 5,
      maxWeightKg: activeLoadingRules.automotiveOversizeGroupMaxWeightKg,
      preferTarp: false,
      method: '汽车件宽高货平板集中',
    },
    wide: {
      maxItems: 7,
      maxWeightKg: activeLoadingRules.automotiveFlatbedGroupMaxWeightKg,
      preferTarp: false,
      method: '汽车件宽货平板面积折算',
    },
    'medium-wide': {
      maxItems: 10,
      maxWeightKg: activeLoadingRules.automotiveFlatbedGroupMaxWeightKg,
      preferTarp: false,
      method: '汽车件中宽货平板并车',
    },
    medium: {
      maxItems: 18,
      maxWeightKg: activeLoadingRules.automotiveFlatbedGroupMaxWeightKg,
      preferTarp: true,
      method: '汽车件篷布优先并排',
    },
    normal: {
      maxItems: 34,
      maxWeightKg: activeLoadingRules.automotiveFlatbedGroupMaxWeightKg,
      preferTarp: true,
      method: '汽车件小件篷布收尾',
    },
  };

  while (rest.length) {
    const seed = rest[0];
    const band = automotiveWidthBand(seed);
    const config = groupConfigs[band];
    const group: CargoUnit[] = [seed];
    rest = rest.slice(1);

    for (const item of [...rest].sort((a, b) => b.weightKg - a.weightKg || b.widthCm - a.widthCm || b.lengthCm - a.lengthCm)) {
      const sameBand = automotiveWidthBand(item) === band || (band === 'normal' && automotiveWidthBand(item) === 'medium');
      if (!sameBand) continue;
      if (!canAddToAutomotiveBin(group, item, config.maxItems, config.maxWeightKg, maxLength)) continue;
      group.push(item);
      rest = rest.filter((candidate) => candidate.unitId !== item.unitId);
    }

    const requiredWeight = sumWeight(group);
    const width = maxWidth(group);
    const height = group.reduce((max, item) => Math.max(max, item.heightCm), 0);
    const vehicle =
      width >= 3_400 || height >= 3_500 || requiredWeight > activeLoadingRules.automotiveFlatbedGroupMaxWeightKg
        ? chooseAutomotiveOversize(vehicles, requiredWeight, width, height)
        : config.preferTarp && width <= 2_500 && height <= 2_600
          ? chooseAutomotiveTarp(vehicles, requiredWeight)
          : chooseAutomotiveFlatbed(vehicles, requiredWeight, width);

    if (!vehicle) {
      rest = [...group, ...rest];
      break;
    }

    bins.push({
      vehicle,
      method: config.method,
      items: group,
      warnings: [
        `汽车大批量件按车组优化：估算排布长度 ${Math.round(automotivePackedLengthMm(group))}mm，最大宽 ${width}mm，最大高 ${height}mm。`,
        '该规则按同事方案沉淀：优先控制整票总成本，再按宽高等级分组并复核绑扎、超限证和现场摆放。',
      ],
    });
  }

  return { bins, rest };
}

function takeMatching(pool: CargoUnit[], predicate: (item: CargoUnit) => boolean) {
  const selected = pool.filter(predicate);
  return {
    selected,
    rest: removeFromPool(pool, selected),
  };
}

function buildProjectBatchBins(pool: CargoUnit[], vehicles: LoadingVehicle[]) {
  const flatbed = chooseProjectFlatbed(vehicles);
  const tarp = chooseProjectTarp(vehicles);
  if (!flatbed || !tarp || !isProjectBatch(pool)) {
    return { bins: [] as WorkBin[], rest: pool };
  }

  const bins: WorkBin[] = [];
  let rest = [...pool];
  const addBin = (vehicle: LoadingVehicle, method: string, predicate: (item: CargoUnit) => boolean, warnings: string[]) => {
    const taken = takeMatching(rest, predicate);
    if (!taken.selected.length) return;
    bins.push({
      vehicle,
      method,
      items: taken.selected,
      warnings,
    });
    rest = taken.rest;
  };

  addBin(
    flatbed,
    '17米5轴平板矩阵摆放',
    (item) => hasSlashSeries(item) && numberRange(item, 1, 16, true),
    ['同系列不可压货物按平板单层矩阵摆放；不可摆放表示不能压货，不影响同车并排。'],
  );
  addBin(
    flatbed,
    '17米5轴平板矩阵摆放',
    (item) =>
      (hasSlashSeries(item) && (numberRange(item, 17, 30, true) || numberIn(item, [54, 55]))) ||
      numberIn(item, [29]),
    ['同系列规则件按单层矩阵摆放，长条窄件作为侧边补位。'],
  );
  addBin(
    flatbed,
    '17米5轴平板交错矩阵摆放',
    (item) => hasSlashSeries(item) && (numberRange(item, 31, 38, true) || numberRange(item, 43, 50, true)),
    ['窄件与同系列件交错并排，按平板矩阵复核宽度和绑扎。'],
  );
  addBin(
    flatbed,
    '17米5轴平板叠放',
    (item) =>
      numberRange(item, 1, 10, false) ||
      numberRange(item, 13, 16, false) ||
      (hasSlashSeries(item) && numberIn(item, [39, 64])),
    ['空白要求货物默认允许叠放；叠放层数需现场复核受力面。'],
  );
  addBin(
    flatbed,
    '17米5轴平板叠放',
    (item) =>
      numberRange(item, 17, 22, false) ||
      numberRange(item, 30, 33, false) ||
      (hasSlashSeries(item) && numberIn(item, [58, 59, 60, 61, 65, 66])),
    ['空白要求与可摆放货物组合叠放，红字不可摆放货物仅作顶层或单层摆放。'],
  );
  addBin(
    tarp,
    '篷布车小件收尾并排',
    () => true,
    ['剩余小件集中篷布车收尾，按并排和局部叠放复核。'],
  );

  return { bins, rest };
}

function choosePipeBatchTarpVehicle(vehicles: LoadingVehicle[], requiredWeight: number) {
  const candidates = vehicles
    .filter(isTarpVehicle)
    .filter((vehicle) => vehiclePayloadLimit(vehicle) >= requiredWeight && (!vehicleLengthMm(vehicle) || vehicleLengthMm(vehicle) >= 12_000))
    .sort((a, b) => {
      const aScore =
        Number(vehicleText(a).includes('大通道')) * 30 +
        Number((vehicleLengthMm(a) ?? 0) >= 13_000) * 10 +
        Number((a.axleCount ?? a.lineCount ?? 0) >= 5) * 5;
      const bScore =
        Number(vehicleText(b).includes('大通道')) * 30 +
        Number((vehicleLengthMm(b) ?? 0) >= 13_000) * 10 +
        Number((b.axleCount ?? b.lineCount ?? 0) >= 5) * 5;
      return bScore - aScore || vehiclePriceSort(a) - vehiclePriceSort(b) || vehiclePayloadLimit(a) - vehiclePayloadLimit(b);
    });
  return candidates[0] ?? null;
}

function choosePipeBatchVehicle(vehicles: LoadingVehicle[], requiredWeight: number, preferTarp: boolean) {
  const tarp = preferTarp ? choosePipeBatchTarpVehicle(vehicles, requiredWeight) : null;
  if (tarp) return tarp;
  const candidates = vehicles
    .filter(isFlatbedVehicle)
    .filter((vehicle) => vehiclePayloadLimit(vehicle) >= requiredWeight && (!vehicleLengthMm(vehicle) || vehicleLengthMm(vehicle) >= 12_000))
    .sort((a, b) => {
      const aScore =
        Number(vehicleText(a).includes('17')) * 20 +
        Number((a.axleCount ?? a.lineCount) === 6) * 12 +
        Number(vehicleLengthMm(a) >= 16_000) * 5;
      const bScore =
        Number(vehicleText(b).includes('17')) * 20 +
        Number((b.axleCount ?? b.lineCount) === 6) * 12 +
        Number(vehicleLengthMm(b) >= 16_000) * 5;
      return bScore - aScore || vehiclePriceSort(a) - vehiclePriceSort(b) || vehiclePayloadLimit(a) - vehiclePayloadLimit(b);
    });
  return candidates[0] ?? chooseGeneralFlatbed(vehicles, requiredWeight);
}

function buildPipeBatchBins(pool: CargoUnit[], vehicles: LoadingVehicle[], options: LoadingPlanOptions) {
  if (!isPipeBatch(pool)) {
    return { bins: [] as WorkBin[], rest: pool };
  }
  const pipeItems = pool.filter(isPipeCargo);
  const rest = removeFromPool(pool, pipeItems);
  const loadingStrategy = options.loadingStrategy ?? 'quoteSafe';
  const isLargeDiameterPipeBatch = pipeItems.some((item) => Math.max(item.widthCm, item.heightCm) >= activeLoadingRules.pipeBatchLargeDiameterMm);
  const preferTarpSafe =
    loadingStrategy === 'quoteSafe' &&
    isLargeDiameterPipeBatch &&
    vehicles.some((vehicle) => isTarpVehicle(vehicle) && (!vehicleLengthMm(vehicle) || vehicleLengthMm(vehicle) >= 12_000));
  const targetWeight = preferTarpSafe
    ? Math.min(activeLoadingRules.pipeBatchTarpSafeMaxWeightKg, activeLoadingRules.pipeBatchQuoteSafeMaxWeightKg)
    : loadingStrategy === 'quoteSafe'
      ? Math.min(activeLoadingRules.pipeBatchQuoteSafeMaxWeightKg, activeLoadingRules.flatbedWeightLimitKg)
      : activeLoadingRules.flatbedWeightLimitKg;

  const groups: CargoUnit[][] = [];
  const sorted = [...pipeItems].sort((a, b) => b.weightKg - a.weightKg || b.lengthCm - a.lengthCm || b.widthCm - a.widthCm);
  for (const item of sorted) {
    let target: CargoUnit[] | null = null;
    for (const group of groups) {
      const nextWeight = sumWeight(group) + item.weightKg;
      if (nextWeight > targetWeight) continue;
      if (Math.max(maxLength(group), item.lengthCm) > 12_500 && maxLength(group) !== item.lengthCm) continue;
      target = group;
      break;
    }
    if (!target) {
      target = [];
      groups.push(target);
    }
    target.push(item);
  }

  const bins: WorkBin[] = [];
  const unhandled: CargoUnit[] = [];
  for (const group of groups) {
    const weight = sumWeight(group);
    const vehicle = choosePipeBatchVehicle(vehicles, Math.min(weight, activeLoadingRules.flatbedWeightLimitKg), preferTarpSafe);
    if (!vehicle) {
      unhandled.push(...group);
      continue;
    }
    bins.push({
      vehicle,
      method: preferTarpSafe ? '管材篷布大通道保守分组' : '管材批量成捆分层装载',
      items: group,
      warnings: [
        preferTarpSafe
          ? `大直径管材篷布保守规则：允许堆叠/可摆放只表示同类管材可分层并排，不按车辆载重极限压满；本车装载总长 ${maxLength(group)}mm，单车重量 ${weight.toFixed(2)}kg。`
          : `管材批量规则：允许堆叠/可摆放表示可成捆分层和并排，不按单根长方体方数拆车；本车装载总长 ${maxLength(group)}mm，单车重量 ${weight.toFixed(2)}kg。`,
        preferTarpSafe
          ? '报价稳妥模式按篷布大通道经验重量留余量，目标接近同事 28 台方案；现场需复核管径层数、垫木、防滚、防滑、绑扎和车厢净空。'
          : '报价阶段按重量留余量，现场需复核管径层数、垫木、防滚、防滑、绑扎和车辆轴荷。',
      ],
    });
  }

  return { bins, rest: [...rest, ...unhandled] };
}

function canAddToRussiaCostBin(bin: CargoItem[], cargo: CargoItem, vehicle: LoadingVehicle, maxItems: number, maxVolumeCbm: number) {
  const next = [...bin, cargo];
  return (
    next.length <= maxItems &&
    sumWeight(next) <= Math.min(vehiclePayloadLimit(vehicle) || Number.MAX_SAFE_INTEGER, activeLoadingRules.indivisibleSingleVehicleKg) &&
    sumVolume(next) <= maxVolumeCbm
  );
}

function buildRussiaCostOptimizedBins(pool: CargoUnit[], vehicles: LoadingVehicle[], options: LoadingPlanOptions) {
  const flatbed = chooseProjectFlatbed(vehicles);
  const tarp = chooseProjectTarp(vehicles);
  if (!isRussiaDestination(options) || !flatbed || !tarp || pool.length < activeLoadingRules.russiaBatchMinItems || pool.some(hasSlashSeries)) {
    return { bins: [] as WorkBin[], rest: pool };
  }

  const bins: WorkBin[] = [];
  let rest = [...pool];

  const takeGroup = (
    vehicle: LoadingVehicle,
    method: string,
    predicate: (item: CargoUnit) => boolean,
    maxItems: number,
    maxVolumeCbm: number,
    warnings: string[],
    sort: (a: CargoUnit, b: CargoUnit) => number = (a, b) => b.widthCm - a.widthCm || b.heightCm - a.heightCm || b.lengthCm - a.lengthCm,
  ) => {
    const group: CargoUnit[] = [];
    for (const item of rest.filter(predicate).sort(sort)) {
      if (!canAddToRussiaCostBin(group, item, vehicle, maxItems, maxVolumeCbm)) continue;
      group.push(item);
    }
    if (!group.length) return;
    bins.push({ vehicle, method, items: group, warnings });
    rest = removeFromPool(rest, group);
  };

  takeGroup(
    flatbed,
    '俄罗斯宽货平板超限费集中处理',
    (item) => item.widthCm >= activeLoadingRules.russiaFlatbedRequiredWidthMm && item.heightCm < activeLoadingRules.russiaHighCargoMm,
    5,
    125,
    ['宽度超过俄罗斯篷布优选范围，集中平板办理超宽/超限费用，避免扩大整票高价车型数量。'],
  );

  takeGroup(
    flatbed,
    '俄罗斯高货平板集中处理',
    (item) => item.heightCm >= activeLoadingRules.russiaHighCargoMm && item.widthCm >= 1_800,
    5,
    125,
    ['高度 3300mm 以上货物优先平板，按俄罗斯车货总高 5200mm 复核。'],
    (a, b) => b.widthCm - a.widthCm || b.heightCm - a.heightCm || b.weightKg - a.weightKg,
  );

  takeGroup(
    flatbed,
    '俄罗斯窄高货平板并排',
    (item) => item.heightCm >= activeLoadingRules.russiaHighCargoMm || (item.widthCm <= 2_050 && item.heightCm >= 2_300),
    9,
    150,
    ['窄高货按平板并排组合，减少车辆数；需现场复核车货总高、绑扎和侧向稳定。'],
    (a, b) => b.heightCm - a.heightCm || b.lengthCm - a.lengthCm || b.weightKg - a.weightKg,
  );

  takeGroup(
    tarp,
    '俄罗斯篷布中宽货低成本组合',
    (item) => item.widthCm <= activeLoadingRules.russiaTarpPreferredWidthMm && item.heightCm <= 2_900 && item.widthCm >= 2_100,
    5,
    110,
    ['俄罗斯成本优化：可进篷布的中宽货优先篷布，装前复核内宽、内高和篷布结构。'],
  );

  takeGroup(
    tarp,
    '俄罗斯篷布中等件组合',
    (item) => item.widthCm <= 2_400 && item.heightCm <= 2_900 && item.lengthCm <= 3_400,
    5,
    90,
    ['中等尺寸货物优先使用低成本篷布车，现场复核装卸顺序。'],
  );

  takeGroup(
    flatbed,
    '俄罗斯长货平板超长处理',
    (item) => item.lengthCm >= 3_700 || (item.lengthCm >= 2_200 && item.widthCm <= 1_800 && item.heightCm <= 1_500),
    5,
    85,
    ['长货集中平板，必要时办理超长/超限费用，按整票总成本控制。'],
    (a, b) => b.lengthCm - a.lengthCm || b.weightKg - a.weightKg,
  );

  takeGroup(
    tarp,
    '俄罗斯篷布普通件组合',
    (item) => item.widthCm <= 2_200 && item.heightCm <= 2_900,
    5,
    80,
    ['普通尺寸货物优先篷布，降低整票成本。'],
  );

  takeGroup(
    tarp,
    '俄罗斯篷布小件并排收尾',
    () => true,
    24,
    105,
    ['剩余小件集中篷布车并排收尾，按重货在下、轻货在上复核。'],
    (a, b) => b.weightKg - a.weightKg || b.heightCm - a.heightCm || b.lengthCm - a.lengthCm,
  );

  return { bins: bins.filter((bin) => bin.items.length), rest };
}

function isMixedLongOversizeProject(pool: CargoUnit[]) {
  if (
    pool.length < activeLoadingRules.mixedLongProjectMinItems ||
    pool.length > activeLoadingRules.mixedLongProjectMaxItems ||
    pool.some(hasSlashSeries)
  ) {
    return false;
  }
  const extraLong = pool.filter((item) => item.lengthCm >= 20_000 && item.widthCm >= 3_500);
  const longAnchors = pool.filter(
    (item) =>
      item.lengthCm >= activeLoadingRules.mixedLongAnchorMinLengthMm &&
      item.lengthCm < 13_000 &&
      item.widthCm >= 2_400 &&
      item.widthCm <= 2_900,
  );
  const shortWide = pool.filter((item) => item.lengthCm >= 3_000 && item.lengthCm <= 4_200 && item.widthCm >= 2_600 && item.widthCm <= 3_000);
  return extraLong.length >= 2 && longAnchors.length >= 2 && shortWide.length >= 2;
}

function buildMixedLongOversizeProjectBins(pool: CargoUnit[], vehicles: LoadingVehicle[], options: LoadingPlanOptions) {
  const flatbed = chooseProjectFlatbed(vehicles);
  if (!flatbed || !isMixedLongOversizeProject(pool)) {
    return { bins: [] as WorkBin[], rest: pool };
  }

  const bins: WorkBin[] = [];
  let rest = [...pool];

  const take = (items: CargoUnit[]) => {
    rest = removeFromPool(rest, items);
    return items;
  };

  const addBin = (vehicle: LoadingVehicle, method: string, items: CargoUnit[], warnings: string[]) => {
    if (!items.length) return;
    bins.push({ vehicle, method, items: take(items), warnings });
  };

  const extraLong = rest.filter((item) => item.lengthCm >= 20_000 && item.widthCm >= 3_500).sort((a, b) => b.lengthCm - a.lengthCm || b.weightKg - a.weightKg);
  for (const item of extraLong) {
    const vehicle = chooseOversizeVehicle(vehicles, [item]);
    if (vehicle) {
      addBin(vehicle, '超限车超长单件运输', [item], ['20 米以上超长、超宽大件单独一车，按超限证、路线和转弯半径复核。']);
    }
  }

  const anchors = rest
    .filter((item) => item.lengthCm >= activeLoadingRules.mixedLongAnchorMinLengthMm && item.lengthCm <= 11_500 && item.widthCm >= 2_400 && item.widthCm <= 2_900)
    .sort((a, b) => b.lengthCm - a.lengthCm || b.weightKg - a.weightKg);
  for (const anchor of anchors) {
    if (!rest.some((item) => item.unitId === anchor.unitId)) continue;
    const group: CargoUnit[] = [anchor];
    const fillers = rest
      .filter((item) => item.unitId !== anchor.unitId)
      .filter((item) => item.lengthCm >= 3_000 && item.lengthCm <= 4_200 && item.widthCm >= 2_600 && item.widthCm <= 3_000)
      .sort((a, b) => b.weightKg - a.weightKg || b.lengthCm - a.lengthCm);
    for (const filler of fillers) {
      const next = [...group, filler];
      if (next.length > 3) continue;
      if (next.reduce((sum, item) => sum + placementLengthMm(item), 0) > activeLoadingRules.mixedLongCarrierMaxLengthMm) continue;
      if (sumWeight(next) > activeLoadingRules.flatbedWeightLimitKg) continue;
      group.push(filler);
      if (group.length >= 3) break;
    }
    if (group.length >= 2) {
      addBin(flatbed, '17米5轴平板长件带短宽件', group, ['长件带短宽件组合，按总长复核超长证和前后悬，宽度 2800mm 左右按超宽复核。']);
    }
  }

  const reservedForFlatbed = rest
    .filter((item) => item.lengthCm >= 4_800 && item.lengthCm <= 6_000 && item.widthCm >= 1_350 && item.widthCm <= 2_000)
    .sort((a, b) => b.weightKg - a.weightKg || b.lengthCm - a.lengthCm);
  const reservedIds = new Set(reservedForFlatbed.map((item) => item.unitId));
  const bulkCandidates = rest
    .filter((item) => !reservedIds.has(item.unitId))
    .filter((item) => item.lengthCm <= 5_800 && item.widthCm <= 1_550 && item.heightCm <= 2_100)
    .sort((a, b) => b.weightKg - a.weightKg || b.lengthCm - a.lengthCm);
  const bulk: CargoUnit[] = [];
  const bulkWeightLimit = isUzbekistanDestination(options) ? activeLoadingRules.multiCargoHardSplitWeightKg - 1 : activeLoadingRules.mixedBulkOversizeMaxWeightKg;
  for (const item of bulkCandidates) {
    if (sumWeight([...bulk, item]) > bulkWeightLimit) continue;
    bulk.push(item);
  }
  if (bulk.length >= 8) {
    const vehicle = chooseAutomotiveOversize(vehicles, sumWeight(bulk), maxWidth(bulk), bulk.reduce((max, item) => Math.max(max, item.heightCm), 0));
    if (vehicle) {
      addBin(vehicle, '超限车低矮小件集中合装', bulk, [
        isUzbekistanDestination(options)
          ? `乌兹别克规则：超限车多件合装控制在 ${activeLoadingRules.multiCargoHardSplitWeightKg}kg 以下，本车总重 ${sumWeight(bulk).toFixed(2)}kg。`
          : `超限车特例：多件合装总重 ${sumWeight(bulk).toFixed(2)}kg，超过 44 吨时仅限非乌兹别克线路；必须人工复核轴荷、证件、路线和现场绑扎后才可执行。`,
        '低矮小件集中消化用于降低整票车辆数和总成本，不作为普通平板/篷布默认规则。',
      ]);
    }
  }

  const finalGroup = [...rest].sort((a, b) => b.weightKg - a.weightKg || b.lengthCm - a.lengthCm);
  if (finalGroup.length) {
    addBin(flatbed, '17米5轴平板剩余件并排收尾', finalGroup, ['剩余中长件和轻小件并排/补位，按宽度、重心和绑扎复核。']);
  }

  return { bins, rest };
}

function isRussiaIndustrialBatch(pool: CargoUnit[], options: LoadingPlanOptions) {
  if (!isRussiaDestination(options) || isUzbekistanDestination(options) || pool.length < activeLoadingRules.russiaIndustrialMinItems || pool.some(hasSlashSeries)) {
    return false;
  }
  const wideMedium = pool.filter(
    (item) =>
      item.widthCm >= activeLoadingRules.russiaIndustrialWideWidthMm &&
      item.widthCm <= 3_300 &&
      item.heightCm <= activeLoadingRules.russiaIndustrialWideHeightMm &&
      item.weightKg <= activeLoadingRules.flatbedWeightLimitKg,
  );
  const smallDense = pool.filter((item) => item.lengthCm <= 6_500 && item.widthCm <= 2_500 && item.heightCm <= 2_300 && item.weightKg >= 1_000);
  return wideMedium.length >= 1 && smallDense.length >= 4;
}

function canAddToRussiaIndustrialTarpBin(bin: CargoItem[], cargo: CargoItem, maxWeightKg: number) {
  const next = [...bin, cargo];
  return (
    cargo.widthCm <= activeLoadingRules.russiaTarpPreferredMaxWidthMm &&
    cargo.heightCm <= activeLoadingRules.russiaTarpPreferredMaxHeightMm &&
    sumWeight(next) <= maxWeightKg &&
    floorPlanLengthMm(next, 2_400) <= 13_600
  );
}

function isRussiaHighWideCargo(cargo: CargoItem) {
  return cargo.widthCm >= activeLoadingRules.russiaHighWideFlatbedWidthMm || cargo.heightCm >= activeLoadingRules.russiaHighWideFlatbedHeightMm;
}

function isRussiaTarpPreferredCargo(cargo: CargoItem) {
  return cargo.widthCm <= activeLoadingRules.russiaTarpPreferredMaxWidthMm && cargo.heightCm <= activeLoadingRules.russiaTarpPreferredMaxHeightMm;
}

function likelySideBySideWidthMm(items: CargoItem[]) {
  const sameHeightBand = [...items]
    .filter(
      (item) =>
        placementWidthMm(item) <= activeLoadingRules.russiaTarpPreferredMaxWidthMm &&
        item.heightCm <= activeLoadingRules.russiaTarpPreferredMaxHeightMm,
    )
    .sort((a, b) => placementWidthMm(b) - placementWidthMm(a) || b.weightKg - a.weightKg)
    .slice(0, 2);
  return sameHeightBand.reduce((sum, item) => sum + placementWidthMm(item), 0);
}

function buildRussiaIndustrialBatchBins(pool: CargoUnit[], vehicles: LoadingVehicle[], options: LoadingPlanOptions) {
  if (!isRussiaIndustrialBatch(pool, options)) {
    return { bins: [] as WorkBin[], rest: pool };
  }

  const bins: WorkBin[] = [];
  let rest = [...pool];
  const addBin = (vehicle: LoadingVehicle, method: string, items: CargoUnit[], warnings: string[]) => {
    if (!items.length) return;
    bins.push({ vehicle, method, items, warnings });
    rest = removeFromPool(rest, items);
  };

  const wideGroup: CargoUnit[] = [];
  for (const item of rest
    .filter((candidate) => isRussiaHighWideCargo(candidate) && candidate.widthCm <= 3_700 && candidate.heightCm <= 3_500)
    .sort((a, b) => b.heightCm - a.heightCm || b.widthCm - a.widthCm || b.weightKg - a.weightKg)) {
    const next = [...wideGroup, item];
    if (sumWeight(next) > activeLoadingRules.flatbedWeightLimitKg || next.reduce((sum, cargo) => sum + placementLengthMm(cargo), 0) > 17_000) continue;
    wideGroup.push(item);
  }
  if (wideGroup.length) {
    const vehicle = chooseAxleFlatbed(vehicles, sumWeight(wideGroup), 6);
    if (vehicle) {
      addBin(vehicle, '俄罗斯17米6轴平板宽高件办超限证', wideGroup, [
        '俄罗斯线路宽 3100mm+ 或高 3200mm+ 的高宽组合，优先 17米6轴/7轴平板办理超宽/超高许可，避免误进篷布。',
      ]);
    }
  }

  const buildTarpGroup = (preferred: (item: CargoUnit) => boolean, method: string) => {
    const group: CargoUnit[] = [];
    for (const item of rest.filter(preferred).sort((a, b) => b.weightKg - a.weightKg || b.lengthCm - a.lengthCm)) {
      if (!canAddToRussiaIndustrialTarpBin(group, item, activeLoadingRules.russiaIndustrialTarpMaxWeightKg)) continue;
      group.push(item);
    }
    if (!group.length) return;
    const vehicle = chooseAxleTarp(vehicles, sumWeight(group), 6);
    if (vehicle) {
      const sideBySideWidth = likelySideBySideWidthMm(group);
      addBin(vehicle, method, group, [
        '俄罗斯线路：宽 2400mm 左右、高 2500mm 内的中小件优先 5/6轴篷布，按内宽、内高、载重和装卸顺序复核。',
        sideBySideWidth > activeLoadingRules.russiaTarpSideBySideReviewWidthMm
          ? `篷布并排估算宽度 ${sideBySideWidth}mm 超过 ${activeLoadingRules.russiaTarpSideBySideReviewWidthMm}mm，需改平板或人工确认并排方式。`
          : '',
      ].filter(Boolean));
    }
  };

  buildTarpGroup(
    (item) =>
      item.lengthCm >= 2_000 &&
      isRussiaTarpPreferredCargo(item) &&
      item.heightCm >= 1_500 &&
      item.heightCm <= activeLoadingRules.russiaTarpPreferredMaxHeightMm,
    '俄罗斯6轴篷布中等件合装',
  );
  buildTarpGroup(() => true, '俄罗斯6轴篷布窄小重货收尾');

  return { bins, rest };
}

function isRussiaLongCargoBatch(pool: CargoUnit[], options: LoadingPlanOptions) {
  if (!isRussiaDestination(options) || isUzbekistanDestination(options) || pool.some(hasSlashSeries)) {
    return false;
  }
  const longCargo = pool.filter((item) => item.lengthCm >= activeLoadingRules.russiaLongCargoMinLengthMm && item.widthCm <= 1_200);
  return longCargo.length >= 4;
}

function longCargoBucket(lengthMm: number) {
  return Math.round(lengthMm / 1000) * 1000;
}

function canAddToRussiaLongCargoBin(bin: CargoItem[], cargo: CargoItem) {
  const next = [...bin, cargo];
  return (
    next.reduce((sum, item) => sum + item.widthCm, 0) <= activeLoadingRules.russiaLongCargoTargetWidthMm &&
    sumWeight(next) <= activeLoadingRules.russiaLongCargoMaxGroupWeightKg
  );
}

function buildRussiaLongCargoBins(pool: CargoUnit[], vehicles: LoadingVehicle[], options: LoadingPlanOptions) {
  if (!isRussiaLongCargoBatch(pool, options)) {
    return { bins: [] as WorkBin[], rest: pool };
  }

  const bins: WorkBin[] = [];
  let rest = [...pool];
  const oversizeVehicles = vehicles.filter(isOversizeVehicle);
  const longCargo = rest
    .filter((item) => item.lengthCm >= activeLoadingRules.russiaLongCargoMinLengthMm && item.widthCm <= 1_200)
    .sort((a, b) => longCargoBucket(b.lengthCm) - longCargoBucket(a.lengthCm) || b.weightKg - a.weightKg || b.widthCm - a.widthCm);

  const buckets = new Map<number, CargoUnit[]>();
  for (const item of longCargo) {
    const bucket = longCargoBucket(item.lengthCm);
    buckets.set(bucket, [...(buckets.get(bucket) ?? []), item]);
  }

  for (const [, bucketItems] of [...buckets.entries()].sort((a, b) => b[0] - a[0])) {
    let candidates = [...bucketItems].sort((a, b) => b.weightKg - a.weightKg || b.widthCm - a.widthCm);
    while (candidates.length) {
      const group: CargoUnit[] = [];
      for (const item of [...candidates]) {
        if (!canAddToRussiaLongCargoBin(group, item)) continue;
        group.push(item);
        candidates = candidates.filter((candidate) => candidate.unitId !== item.unitId);
      }
      if (!group.length) break;
      const width = group.reduce((sum, item) => sum + item.widthCm, 0);
      const height = group.reduce((max, item) => Math.max(max, item.heightCm), 0);
      const weight = sumWeight(group);
      const vehicle = chooseAutomotiveOversize(oversizeVehicles.length ? oversizeVehicles : vehicles, weight, width, height);
      if (!vehicle) {
        break;
      }
      bins.push({
        vehicle,
        method: '俄罗斯长货超限车同长度段合装',
        items: group,
        warnings: [
          `俄罗斯长货特例：${Math.round(maxLength(group) / 1000)}米级长货按同长度段合装，累计宽度 ${width}mm，总重 ${weight.toFixed(2)}kg。`,
          weight > activeLoadingRules.multiCargoHardSplitWeightKg
            ? '本车多件合装超过 44 吨，仅适用于不经过乌兹别克的俄罗斯线路，需复核轴荷、超限许可和绑扎。'
            : '按俄罗斯超限路线复核累计宽度、前后悬和绑扎。',
        ],
      });
    }
  }

  const used = bins.flatMap((bin) => bin.items);
  rest = removeFromPool(rest, used);
  return { bins, rest };
}

function chooseOversizeVehicle(vehicles: LoadingVehicle[], items: CargoItem[]) {
  const text = items.map((item) => `${item.name} ${item.remark ?? ''}`).join(' ');
  const width = maxWidth(items);
  const height = items.reduce((max, item) => Math.max(max, item.heightCm), 0);
  const requiredWeight = sumWeight(items);
  const oversizeVehicles = vehicles.filter((vehicle) => (items.some(requiresSpecialDeck) ? isSpecialDeckVehicle(vehicle) : isOversizeVehicle(vehicle)));
  const preferred = oversizeVehicles
    .map((vehicle) => {
      let score = vehiclePayloadLimit(vehicle);
      if (width >= 3_500 && includesAny(vehicleText(vehicle), ['超低', '普通特种', '拼接', '轴线'])) score += 20_000;
      if (height >= 4_000 && includesAny(vehicleText(vehicle), ['超低', '塔筒', '轴线'])) score += 15_000;
      if (text.includes('塔') && vehicleText(vehicle).includes('塔筒')) score += 40_000;
      if (requiredWeight >= 60_000 && includesAny(vehicleText(vehicle), ['轴线', '普通特种'])) score += 20_000;
      return { vehicle, score };
    })
    .filter((item) => vehiclePayloadLimit(item.vehicle) >= requiredWeight)
    .sort((a, b) => b.score - a.score);
  return preferred[0]?.vehicle ?? chooseVehicle(vehicles, isOversizeVehicle, requiredWeight);
}

function canAddToOversizeBin(bin: CargoItem[], cargo: CargoItem, maxItems = 4) {
  const next = [...bin, cargo];
  return (
    (next.length <= 1 || sumWeight(next) < activeLoadingRules.multiCargoHardSplitWeightKg) &&
    sumWeight(next) <= activeLoadingRules.indivisibleSingleVehicleKg &&
    sumVolume(next) <= 240 &&
    next.length <= maxItems
  );
}

function removeFromPool(pool: CargoUnit[], selected: CargoUnit[]) {
  const selectedIds = new Set(selected.map((item) => item.unitId));
  return pool.filter((item) => !selectedIds.has(item.unitId));
}

function buildOversizeBins(pool: CargoUnit[], vehicles: LoadingVehicle[]) {
  const bins: WorkBin[] = [];
  const singleHeavy = pool.filter(requiresSingleVehicle).sort((a, b) => b.weightKg - a.weightKg);
  for (const item of singleHeavy) {
    const vehicle = chooseOversizeVehicle(vehicles, [item]);
    if (vehicle) {
      bins.push({
        vehicle,
        method: '超限车单件运输',
        items: [item],
        warnings: [`单件重量超过 ${activeLoadingRules.indivisibleSingleVehicleKg}kg，按中亚不可拆分货物规则单独一车。`],
      });
    }
  }
  const singleHeavyIds = new Set(singleHeavy.map((item) => item.unitId));
  const oversizePool = pool
    .filter((item) => !singleHeavyIds.has(item.unitId))
    .filter(shouldPreferOversize)
    .sort((a, b) => Number(isHeavyForFlatbed(b)) - Number(isHeavyForFlatbed(a)) || b.widthCm - a.widthCm || b.weightKg - a.weightKg);
  let remaining = [...oversizePool];

  const heavySeeds = remaining.filter(isHeavyForFlatbed).sort((a, b) => b.widthCm - a.widthCm || b.weightKg - a.weightKg);
  while (heavySeeds.length) {
    const seed = heavySeeds.shift();
    if (!seed || !remaining.some((item) => item.unitId === seed.unitId)) {
      continue;
    }
    let group: CargoUnit[] = [seed];
    remaining = remaining.filter((item) => item.unitId !== seed.unitId);

    const pair = remaining
      .filter(isHeavyForFlatbed)
      .filter((item) => canAddToOversizeBin(group, item))
      .sort((a, b) => Math.abs(seed.widthCm - a.widthCm) - Math.abs(seed.widthCm - b.widthCm) || b.weightKg - a.weightKg)[0];
    if (pair) {
      group.push(pair);
      remaining = remaining.filter((item) => item.unitId !== pair.unitId);
    }

    const fillers = remaining
      .filter((item) => canAddToOversizeBin(group, item))
      .filter((item) => item.weightKg <= 12_000 || item.heightCm >= 2_500)
      .filter((item) => item.widthCm <= 2_500 || item.heightCm >= 2_500)
      .sort((a, b) => b.heightCm - a.heightCm || b.widthCm - a.widthCm || b.weightKg - a.weightKg);
    for (const filler of fillers) {
      if (group.length >= 4 || !canAddToOversizeBin(group, filler)) {
        continue;
      }
      if (sumWeight(group) > 90_000) {
        continue;
      }
      if (sumWeight(group) > 78_000 && filler.weightKg > 12_000) {
        continue;
      }
      group.push(filler);
      remaining = remaining.filter((item) => item.unitId !== filler.unitId);
    }

    const vehicle = chooseOversizeVehicle(vehicles, group);
    if (vehicle) {
      bins.push({
        vehicle,
        method: '超限车多件合装',
        items: group,
        warnings: ['按超限运输办理证件，复核轴荷、绑扎点、重心和路线限行。'],
      });
    }
  }

  const wideOrHeavy = remaining.filter((item) => shouldPreferOversize(item));
  const paired = new Set<string>();
  for (const item of wideOrHeavy) {
    if (paired.has(item.unitId)) continue;
    let group: CargoUnit[] = [item];
    paired.add(item.unitId);
    const candidates = wideOrHeavy
      .filter((candidate) => !paired.has(candidate.unitId))
      .filter((candidate) => canAddToOversizeBin(group, candidate))
      .sort((a, b) => Math.abs(item.widthCm - a.widthCm) - Math.abs(item.widthCm - b.widthCm) || b.weightKg - a.weightKg);
    for (const candidate of candidates) {
      if (group.length >= 4 || sumWeight(group) + candidate.weightKg > 60_000) continue;
      group.push(candidate);
      paired.add(candidate.unitId);
    }
    if (maxWidth(group) >= 3_500) {
      const fillers = pool
        .filter((candidate) => !paired.has(candidate.unitId))
        .filter((candidate) => !shouldPreferOversize(candidate))
        .filter((candidate) => !isLongFlatbedCargo(candidate))
        .filter((candidate) => isSmallFillerCargo(candidate) || canBeUpperCargo(candidate))
        .filter((candidate) => canAddToOversizeBin(group, candidate, 8))
        .sort(
          (a, b) =>
            Number(cannotBePressed(b)) - Number(cannotBePressed(a)) ||
            Number(canBeUpperCargo(b)) - Number(canBeUpperCargo(a)) ||
            b.lengthCm - a.lengthCm,
        );
      for (const filler of fillers) {
        if (group.length >= 8 || !canAddToOversizeBin(group, filler, 8)) continue;
        group.push(filler);
        paired.add(filler.unitId);
      }
    }
    const vehicle = chooseOversizeVehicle(vehicles, group);
    if (vehicle) {
      bins.push({
        vehicle,
        method: '超限车多件合装',
        items: group,
        warnings: group.some(hasOversizeDimension) ? ['货物存在超长/超宽/超高，需办理超限证。'] : [],
      });
    }
  }

  const used = bins.flatMap((bin) => bin.items);
  return { bins, rest: removeFromPool(pool, used) };
}

function chooseGeneralFlatbed(vehicles: LoadingVehicle[], requiredWeight: number) {
  return (
    vehicles
      .filter(isFlatbedVehicle)
      .filter((vehicle) => vehiclePayloadLimit(vehicle) >= requiredWeight)
      .sort((a, b) => {
        const aText = vehicleText(a);
        const bText = vehicleText(b);
        const aScore = Number(aText.includes('17')) * 20 + Number(a.axleCount === 6 || a.lineCount === 6) * 12 - vehiclePriceSort(a) / 100;
        const bScore = Number(bText.includes('17')) * 20 + Number(b.axleCount === 6 || b.lineCount === 6) * 12 - vehiclePriceSort(b) / 100;
        return bScore - aScore || vehiclePriceSort(a) - vehiclePriceSort(b) || vehiclePayloadLimit(a) - vehiclePayloadLimit(b);
      })[0] ?? chooseVehicle(vehicles, isFlatbedVehicle, requiredWeight)
  );
}

function buildMediumFlatbedCostBins(pool: CargoUnit[], vehicles: LoadingVehicle[]) {
  const bins: WorkBin[] = [];
  let rest = [...pool];
  const flatbed = chooseGeneralFlatbed(vehicles, activeLoadingRules.flatbedWeightLimitKg);
  if (!flatbed) {
    return { bins, rest };
  }

  const seeds = rest.filter(isMediumFlatbedSeed).sort((a, b) => b.weightKg - a.weightKg || b.widthCm - a.widthCm);
  for (const seed of seeds) {
    if (!rest.some((item) => item.unitId === seed.unitId)) continue;
    let group: CargoUnit[] = [seed];
    rest = rest.filter((item) => item.unitId !== seed.unitId);

    const fillers = rest
      .filter((item) => !requiresSingleVehicle(item))
      .filter((item) => item.weightKg <= 6_000 || item.widthCm <= 1_400 || canBeUpperCargo(item))
      .filter((item) => canFlatbedCostGroup([...group, item]))
      .sort(
        (a, b) =>
          Number(b.widthCm <= 1_400) - Number(a.widthCm <= 1_400) ||
          b.weightKg - a.weightKg ||
          b.heightCm - a.heightCm ||
          b.lengthCm - a.lengthCm,
      );

    for (const filler of fillers) {
      if (!canFlatbedCostGroup([...group, filler])) continue;
      group.push(filler);
      rest = rest.filter((item) => item.unitId !== filler.unitId);
    }

    if (group.length > 1) {
      bins.push({
        vehicle: flatbed,
        method: '17米6轴平板总体成本并车',
        items: group,
        warnings: [
          `按整票总成本优化：平板单车成本高于篷布时，仍可通过减少总车数降低整票成本；估算占用长度 ${Math.ceil(floorPlanLengthMm(group))}mm。`,
          '平板车可办理超长/超宽/超高证通行，但单车总重不得超过 31000kg。',
        ],
      });
    } else {
      rest.push(...group);
    }
  }

  const used = bins.flatMap((bin) => bin.items);
  return { bins, rest: removeFromPool(pool, used) };
}

function buildFlatbedConsolidationBins(pool: CargoUnit[], vehicles: LoadingVehicle[]) {
  const bins: WorkBin[] = [];
  let rest = [...pool];

  const mediumFlatbed = buildMediumFlatbedCostBins(rest, vehicles);
  bins.push(...mediumFlatbed.bins);
  rest = mediumFlatbed.rest;

  const longItems = rest.filter(isLongFlatbedCargo).sort((a, b) => b.lengthCm - a.lengthCm || b.weightKg - a.weightKg);
  while (longItems.some((item) => rest.some((candidate) => candidate.unitId === item.unitId))) {
    const seed = longItems.find((item) => rest.some((candidate) => candidate.unitId === item.unitId));
    if (!seed) break;
    const group: CargoUnit[] = [seed];
    rest = rest.filter((item) => item.unitId !== seed.unitId);

    const parallel = rest
      .filter(isLongFlatbedCargo)
      .filter((item) => flatbedCanCarryGroup([...group, item]))
      .filter((item) => group[0].widthCm + item.widthCm <= 2_500)
      .sort((a, b) => Math.abs(seed.lengthCm - a.lengthCm) - Math.abs(seed.lengthCm - b.lengthCm) || b.weightKg - a.weightKg)[0];
    if (parallel) {
      group.push(parallel);
      rest = rest.filter((item) => item.unitId !== parallel.unitId);
    }

    const fillers = rest
      .filter((item) => flatbedCanCarryGroup([...group, item]))
      .filter((item) => isSmallFillerCargo(item) || canBeUpperCargo(item))
      .filter((item) => !cannotBePressed(item) || item.weightKg <= 1_500)
      .sort(
        (a, b) =>
          Number(canBeUpperCargo(b)) - Number(canBeUpperCargo(a)) ||
          b.heightCm - a.heightCm ||
          b.weightKg - a.weightKg,
      );
    for (const filler of fillers) {
      if (group.length >= 4 || !flatbedCanCarryGroup([...group, filler])) continue;
      group.push(filler);
      rest = rest.filter((item) => item.unitId !== filler.unitId);
    }

    const vehicle = chooseGeneralFlatbed(vehicles, sumWeight(group));
    if (vehicle) {
      bins.push({
        vehicle,
        method: '17米6轴平板长货并车',
        items: group,
        warnings: ['长货优先并车；平板如超长可办理超限证，但单车总重不得超过 31000kg。'],
      });
    } else {
      rest.push(...group);
    }
  }

  const stackable = rest.filter(isStackableLargeCargo).sort((a, b) => b.weightKg - a.weightKg || b.lengthCm - a.lengthCm);
  const stackGroup: CargoUnit[] = [];
  for (const item of stackable) {
    if (stackGroup.length >= 10 || !flatbedCanCarryGroup([...stackGroup, item])) continue;
    stackGroup.push(item);
  }
  if (stackGroup.length >= 3) {
    let group = [...stackGroup];
    rest = removeFromPool(rest, stackGroup);
    const topFillers = rest
      .filter((item) => flatbedCanCarryGroup([...group, item]))
      .filter((item) => canBeUpperCargo(item) || isSmallFillerCargo(item))
      .filter((item) => !cannotBePressed(item))
      .sort((a, b) => b.lengthCm - a.lengthCm || b.weightKg - a.weightKg);
    for (const filler of topFillers) {
      if (group.length >= 12 || !flatbedCanCarryGroup([...group, filler])) continue;
      group.push(filler);
      rest = rest.filter((item) => item.unitId !== filler.unitId);
    }
    const vehicle = chooseGeneralFlatbed(vehicles, sumWeight(group));
    if (vehicle) {
      bins.push({
        vehicle,
        method: '17米6轴平板可叠货集中装载',
        items: group,
        warnings: ['可叠货集中处理，装车前复核叠放高度、受力面、防滑和绑扎。'],
      });
    } else {
      rest.push(...group);
    }
  }

  const used = bins.flatMap((bin) => bin.items);
  return { bins, rest: removeFromPool(pool, used) };
}

function canAddToTarpBin(bin: CargoItem[], cargo: CargoItem, vehicle: LoadingVehicle, method: string) {
  const next = [...bin, cargo];
  if (next.some(requiresSpecialDeck)) return false;
  if (sumWeight(next) > vehiclePayloadLimit(vehicle)) return false;
  if (positive(vehicle.effectiveVolume) && sumVolume(next) > positive(vehicle.effectiveVolume) * 1.05) return false;
  const lengthLimit = vehicleLengthMm(vehicle);
  const widthLimit = vehicleWidthMm(vehicle);
  const heightLimit = vehicleHeightMm(vehicle);
  if (lengthLimit && method.includes('长条') && maxLength(next) > lengthLimit) return false;
  if (lengthLimit && !method.includes('长条') && maxLength(next) > lengthLimit) return false;
  if (widthLimit && maxWidth(next) > widthLimit) return false;
  if (heightLimit && next.some((item) => item.heightCm > heightLimit)) return false;
  return true;
}

function buildTarpBins(pool: CargoUnit[], vehicles: LoadingVehicle[]) {
  const bins: WorkBin[] = [];
  let rest = [...pool];
  const tarpVehicles = vehicles.filter(isTarpVehicle);

  const longLow = rest.filter(isLongLowTarpCargo).sort((a, b) => b.lengthCm - a.lengthCm);
  if (longLow.length) {
    const requiredWeight = sumWeight(longLow);
    const vehicle = chooseVehicle(vehicles, isTarpVehicle, requiredWeight);
    if (vehicle) {
      const group: CargoUnit[] = [];
      for (const item of longLow) {
        if (canAddToTarpBin(group, item, vehicle, '篷布车叠放')) {
          group.push(item);
        }
      }
      if (group.length) {
        bins.push({
          vehicle,
          method: '篷布车叠放',
          items: group,
          warnings: ['长条低矮货物按叠放方案复核垫木、防滑和绑扎。'],
        });
        rest = removeFromPool(rest, group);
      }
    }
  }

  const sortable = rest.sort((a, b) => b.weightKg - a.weightKg || b.lengthCm - a.lengthCm);
  for (const item of sortable) {
    let target: WorkBin | null = null;
    for (const bin of bins.filter((candidate) => candidate.method === '篷布车并排叠放')) {
      if (canAddToTarpBin(bin.items, item, bin.vehicle, bin.method)) {
        target = bin;
        break;
      }
    }
    if (!target) {
      const vehicle = chooseVehicle(tarpVehicles, isTarpVehicle, item.weightKg);
      if (!vehicle) continue;
      target = {
        vehicle,
        method: '篷布车并排叠放',
        items: [],
        warnings: ['按并排叠放装载，需现场复核层高、压载面和绑扎。'],
      };
      bins.push(target);
    }
    if (canAddToTarpBin(target.items, item, target.vehicle, target.method)) {
      target.items.push(item);
    }
  }

  const used = bins.flatMap((bin) => bin.items);
  return { bins: bins.filter((bin) => bin.items.length), rest: removeFromPool(pool, used) };
}

function buildFallbackBins(pool: CargoUnit[], vehicles: LoadingVehicle[]) {
  const bins: WorkBin[] = [];
  const sorted = [...pool].sort((a, b) => b.weightKg - a.weightKg || b.lengthCm - a.lengthCm);
  for (const item of sorted) {
    const vehicle =
      (!requiresSpecialDeck(item)
        ? chooseVehicle(vehicles, (candidate) => isFlatbedVehicle(candidate) && item.weightKg <= activeLoadingRules.flatbedWeightLimitKg, item.weightKg)
        : null) ??
      chooseOversizeVehicle(vehicles, [item]);
    if (!vehicle) {
      continue;
    }
    bins.push({
      vehicle,
      method: isFlatbedVehicle(vehicle) ? '平板车单件/少量合装' : '超限车单件',
      items: [item],
      warnings: isFlatbedVehicle(vehicle) && hasOversizeDimension(item) ? ['平板车可办超限证通行，需复核证件和路线。'] : [],
    });
  }
  const used = bins.flatMap((bin) => bin.items);
  return { bins, rest: removeFromPool(pool, used) };
}

function cargoRiskNotes(cargo: CargoItem, vehicle: LoadingVehicle, method: string) {
  const notes: string[] = [];
  const lengthMm = vehicleLengthMm(vehicle);
  const widthMm = vehicleWidthMm(vehicle);
  const heightMm = vehicleHeightMm(vehicle);
  const placementWidth = placementWidthMm(cargo);
  const longSide = Math.max(cargo.lengthCm, cargo.widthCm);
  if (isFlatbedVehicle(vehicle) && lengthMm && placementLengthMm(cargo) > lengthMm) {
    notes.push(`超出平板有效长度 ${lengthMm}mm，需申请超长证`);
  }
  if (requiresSpecialDeck(cargo)) {
    notes.push(`重量/长度=${deckPressureKgPerMm(cargo).toFixed(2)}kg/mm，超过 ${activeLoadingRules.deckPressureLimitKgPerMm}kg/mm，必须使用特种板`);
  }
  if ((isFlatbedVehicle(vehicle) || isSpecialDeckVehicle(vehicle)) && cargo.allowRotate && longSide > activeLoadingRules.rotatedLoadMaxWidthMm) {
    notes.push(`平板车横置后占宽 ${longSide}mm 超过 ${activeLoadingRules.rotatedLoadMaxWidthMm}mm，不按横置缩短长度处理`);
  }
  if (widthMm && placementWidth > widthMm) {
    notes.push(`摆放占宽 ${placementWidth}mm 超出车辆有效宽度 ${widthMm}mm，需复核超宽证或更换车型`);
  }
  if (heightMm && cargo.heightCm > heightMm) {
    notes.push(`超出车辆有效高度 ${heightMm}mm，需复核限高或更换车型`);
  }
  if (placementWidth > activeLoadingRules.oversizeWidthMm) {
    notes.push(`摆放占宽 ${placementWidth}mm，需复核超宽许可`);
  }
  if (cargo.heightCm > activeLoadingRules.oversizeHeightMm) {
    notes.push(`高度 ${cargo.heightCm}mm，需复核限高`);
  }
  if (isOversizeVehicle(vehicle) && cargoVolume(cargo) > activeLoadingRules.oversizeSoftVolumeCbm) {
    notes.push('货物方数较大，超限车按大件运输复核');
  }
  if (method.includes('叠放')) {
    notes.push('按叠放方案复核受力面和绑扎');
  }
  if (vehicleMatchScore(vehicle, cargo) > 0) {
    notes.push('车辆适用场景与货物描述匹配');
  }
  return notes;
}

function binToResult(bin: WorkBin): LoadingVehicleResult {
  const grouped = new Map<string, LoadingAssignment>();
  for (const item of bin.items) {
    const existing = grouped.get(item.sourceId);
    if (existing) {
      existing.quantity += 1;
      existing.weightKg += item.weightKg;
      existing.volumeCbm += cargoVolume(item);
      continue;
    }
    grouped.set(item.sourceId, {
      id: `assign_${bin.vehicle.id}_${item.sourceId}`,
      vehicleId: bin.vehicle.id,
      vehicleName: `${bin.vehicle.category} / ${bin.vehicle.name}`,
      cargoId: item.sourceId,
      cargoName: item.name,
      boxNo: item.boxNo,
      quantity: 1,
      usedLengthCm: placementLengthMm(item),
      lengthCm: item.lengthCm,
      widthCm: item.widthCm,
      heightCm: item.heightCm,
      weightKg: item.weightKg,
      volumeCbm: cargoVolume(item),
      allowRotate: item.allowRotate,
      allowStack: item.allowStack,
      remark: item.remark,
      notes: cargoRiskNotes(item, bin.vehicle, bin.method),
    });
  }
  const assignments = [...grouped.values()];
  const usedWeightKg = assignments.reduce((sum, item) => sum + item.weightKg, 0);
  const usedVolumeCbm = assignments.reduce((sum, item) => sum + item.volumeCbm, 0);
  const payloadLimit = vehiclePayloadLimit(bin.vehicle);
  const volumeLimit = positive(bin.vehicle.effectiveVolume);
  const warnings = [...bin.warnings];
  if (isFlatbedVehicle(bin.vehicle) && usedWeightKg > activeLoadingRules.flatbedWeightLimitKg) {
    warnings.push(`平板车重量超过 ${activeLoadingRules.flatbedWeightLimitKg}kg，不允许承运`);
  }
  if (assignments.length > 1 && usedWeightKg > activeLoadingRules.indivisibleSingleVehicleKg) {
    warnings.push(`多件合装总重超过 ${activeLoadingRules.indivisibleSingleVehicleKg}kg；乌兹别克线路不允许，俄罗斯等其他线路按当地规则、轴荷和证件人工复核。`);
  }
  if (assignments.length > 1 && usedWeightKg >= activeLoadingRules.multiCargoRiskSplitWeightKg) {
    warnings.push(`多件合装总重达到 ${activeLoadingRules.multiCargoRiskSplitWeightKg}kg 以上，接近 44 吨红线，建议拆车或人工确认过磅误差。`);
  }
  if (isTarpVehicle(bin.vehicle)) {
    const maxCargoWidth = maxWidth(bin.items);
    const maxCargoHeight = Math.max(...assignments.map((assignment) => Number(assignment.heightCm ?? 0)), 0);
    const sideBySideWidth = likelySideBySideWidthMm(bin.items);
    if (maxCargoWidth > activeLoadingRules.russiaTarpPreferredMaxWidthMm || maxCargoHeight > activeLoadingRules.russiaTarpPreferredMaxHeightMm) {
      warnings.push(
        `篷布车宽高超过优选范围：单件最大 ${maxCargoWidth}mm x ${maxCargoHeight}mm，需复核篷布车内宽、内高和是否改平板。`,
      );
    }
    if (sideBySideWidth > activeLoadingRules.russiaTarpSideBySideReviewWidthMm) {
      warnings.push(`篷布并排估算宽度 ${sideBySideWidth}mm 超过 ${activeLoadingRules.russiaTarpSideBySideReviewWidthMm}mm，需改平板或人工确认并排方式。`);
    }
  }
  if (payloadLimit && usedWeightKg / payloadLimit > 0.95) {
    warnings.push('载重利用率超过 95%，需复核称重误差');
  }
  if (!isOversizeVehicle(bin.vehicle) && !isFlatbedVehicle(bin.vehicle) && volumeLimit && usedVolumeCbm / volumeLimit > 0.95) {
    warnings.push('方数利用率超过 95%，需复核包装体积');
  }
  return {
    vehicle: bin.vehicle,
    loadingMethod: bin.method,
    assignments,
    usedWeightKg,
    usedVolumeCbm,
    maxLengthCm: maxLength(bin.items),
    weightUtilization: payloadLimit ? Math.round((usedWeightKg / payloadLimit) * 1000) / 10 : 0,
    volumeUtilization: volumeLimit ? Math.round((usedVolumeCbm / volumeLimit) * 1000) / 10 : 0,
    warnings: [...new Set(warnings)],
  };
}

function applyDestinationRules(vehicles: LoadingVehicleResult[], options: LoadingPlanOptions) {
  const countries = options.destinationCountries?.length
    ? options.destinationCountries
    : options.destinationCountry
      ? [options.destinationCountry]
      : [];
  if (!countries.length) return vehicles;
  return vehicles.map((vehicle) => {
    const warnings = [...vehicle.warnings];
    if (countries.some((country) => country.includes('俄罗斯'))) {
      const maxCargoHeight = Math.max(...vehicle.assignments.map((assignment) => Number(assignment.heightCm ?? 0)), 0);
      const cargoHeightLimit = activeLoadingRules.russiaCargoHeightLimitMm || 4_200;
      if (maxCargoHeight && maxCargoHeight > cargoHeightLimit) {
        warnings.push(`俄罗斯规则：车货总高 ${activeLoadingRules.russiaMaxVehicleCargoHeightMm}mm 扣除车辆高度后，货物有效高度按 ${cargoHeightLimit}mm 控制；当前最高 ${maxCargoHeight}mm，需更换车型或重新配载。`);
      }
      if (!maxCargoHeight) {
        warnings.push(`俄罗斯规则：车货总高不得超过 ${activeLoadingRules.russiaMaxVehicleCargoHeightMm}mm，系统按货物有效高度 ${cargoHeightLimit}mm 复核。`);
      }
      const vehicleLimit = vehicleHeightMm(vehicle.vehicle);
      if (vehicleLimit && maxCargoHeight > vehicleLimit) {
        warnings.push(`当前车型有效高度 ${vehicleLimit}mm 低于货物最高 ${maxCargoHeight}mm，需复核车型高度配置。`);
      } else {
        warnings.push(`俄罗斯规则：系统按货物有效高度 ${cargoHeightLimit}mm 校验；如车辆实际空载高度不是约 1000mm，需人工复核总高。`);
      }
    }
    return { ...vehicle, warnings: [...new Set(warnings)] };
  });
}

export function normalizeCargo(item: Partial<CargoItem>): CargoItem {
  const quantity = Math.max(1, Math.round(positive(item.quantity) || 1));
  const lengthCm = positive(item.lengthCm);
  const widthCm = positive(item.widthCm);
  const heightCm = positive(item.heightCm);
  const weightKg = positive(item.weightKg);
  const unitVolume = cargoUnitVolume({
    ...(item as CargoItem),
    lengthCm,
    widthCm,
    heightCm,
    quantity,
    weightKg,
  });
  return {
    id: item.id || `cargo_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    boxNo: item.boxNo?.trim() || `BOX-${Date.now().toString().slice(-6)}`,
    name: item.name?.trim() || '未命名货物',
    lengthCm,
    widthCm,
    heightCm,
    quantity,
    weightKg,
    totalWeightKg: positive(item.totalWeightKg) || quantity * weightKg,
    volumeCbm: positive(item.volumeCbm) || quantity * unitVolume,
    allowRotate: item.allowRotate ?? true,
    allowStack: item.allowStack ?? false,
    remark: item.remark?.trim(),
  };
}

export function validateCargo(item: Partial<CargoItem>) {
  const errors: string[] = [];
  if (!item.boxNo?.trim()) errors.push('箱子序号不能为空');
  if (!item.name?.trim()) errors.push('名称不能为空');
  if (!positive(item.lengthCm)) errors.push('长度必须为正数');
  if (!positive(item.widthCm)) errors.push('宽度必须为正数');
  if (!positive(item.heightCm)) errors.push('高度必须为正数');
  if (!positive(item.quantity)) errors.push('数量必须为正数');
  if (!positive(item.weightKg)) errors.push('重量必须为正数');
  return errors;
}

export function generateLoadingPlan(
  cargoItems: CargoItem[],
  selectedVehicles: LoadingVehicle[],
  options: LoadingPlanOptions = {},
): LoadingPlan {
  const previousRules = activeLoadingRules;
  activeLoadingRules = resolveLoadingRules(options.loadingRules);
  const loadingStrategy = options.loadingStrategy ?? 'quoteSafe';
  try {
    const units = expandCargo(cargoItems);
    const strategyVehicles = prepareVehiclesForStrategy(selectedVehicles, options);
    const pipeBatch = buildPipeBatchBins(units, strategyVehicles, options);
    const automotiveBatch = buildAutomotiveBatchBins(pipeBatch.rest, strategyVehicles);
    const mixedLongProject = buildMixedLongOversizeProjectBins(automotiveBatch.rest, strategyVehicles, options);
    const russiaLongCargoBatch = buildRussiaLongCargoBins(mixedLongProject.rest, strategyVehicles, options);
    const russiaIndustrialBatch = buildRussiaIndustrialBatchBins(russiaLongCargoBatch.rest, strategyVehicles, options);
    const russiaCostBatch = buildRussiaCostOptimizedBins(russiaIndustrialBatch.rest, strategyVehicles, options);
    const projectBatch = buildProjectBatchBins(russiaCostBatch.rest, strategyVehicles);
    const oversize = buildOversizeBins(projectBatch.rest, strategyVehicles);
    const flatbed = buildFlatbedConsolidationBins(oversize.rest, strategyVehicles);
    const tarp = buildTarpBins(flatbed.rest, strategyVehicles);
    const fallback = buildFallbackBins(tarp.rest, strategyVehicles);
    const bins = [
      ...pipeBatch.bins,
      ...automotiveBatch.bins,
      ...mixedLongProject.bins,
      ...russiaLongCargoBatch.bins,
      ...russiaIndustrialBatch.bins,
      ...russiaCostBatch.bins,
      ...projectBatch.bins,
      ...oversize.bins,
      ...flatbed.bins,
      ...tarp.bins,
      ...fallback.bins,
    ];
    const vehicles = applyDestinationRules(bins.map(binToResult), options);
    const assignedIds = new Set(bins.flatMap((bin) => bin.items.map((item) => item.unitId)));
    const unassigned = units
      .filter((item) => !assignedIds.has(item.unitId))
      .map((cargo) => ({
        cargo,
        quantity: 1,
        reasons: ['没有找到满足载重、方数或车型规则的车辆'],
      }));
    const assignedQuantity = vehicles.reduce((sum, vehicle) => sum + vehicle.assignments.reduce((inner, item) => inner + item.quantity, 0), 0);
    const assignedWeightKg = vehicles.reduce((sum, vehicle) => sum + vehicle.usedWeightKg, 0);
    const assignedVolumeCbm = vehicles.reduce((sum, vehicle) => sum + vehicle.usedVolumeCbm, 0);

    return {
      id: `lplan_${Date.now()}`,
      title: options.title?.trim() || `配载方案 ${new Date().toLocaleString()}`,
      createdAt: new Date().toISOString(),
      vehicles,
      unassigned,
      summary: {
        totalCargoQuantity: cargoItems.reduce((sum, cargo) => sum + cargo.quantity, 0),
        assignedQuantity,
        totalWeightKg: cargoItems.reduce((sum, cargo) => sum + cargo.totalWeightKg, 0),
        assignedWeightKg,
        totalVolumeCbm: cargoItems.reduce((sum, cargo) => sum + cargo.volumeCbm, 0),
        assignedVolumeCbm,
        vehicleCount: vehicles.length,
      },
      notes: [
        loadingStrategy === 'quoteSafe'
          ? '当前策略：报价稳妥。配载不压极限，接近重量、长度、宽度、高度红线时优先拆车，避免实际执行装不下或车源涨价导致亏损。'
          : '当前策略：执行优化。允许在人工复核车辆、证件、线路、绑扎和现场摆放后压缩车数，系统仍会保留高风险提醒。',
        `当前规则：项目批量货物优先按 17米5轴平板矩阵摆放；不可摆放表示不能被压，不影响同车并排；空白要求默认允许叠放；除非单件且不可拆分，否则单车总重不能超过 ${activeLoadingRules.indivisibleSingleVehicleKg}kg；单件超过 ${activeLoadingRules.indivisibleSingleVehicleKg}kg 的不可拆分货物必须单独一车。`,
        `多件合装重量规则：总重 ${activeLoadingRules.multiCargoRiskSplitWeightKg}kg 以上提示高风险，总重达到 ${activeLoadingRules.multiCargoHardSplitWeightKg}kg 时不再自动合车，优先拆车。`,
        '汽车大批量件规则：按同事方案沉淀，先按宽高等级分组；超宽件线性排布，普通件按面积折算长度，目标控制 17 米左右车组和整票总成本。',
        '混合长件/超限项目规则：20 米以上超长件单独走超限；10 米左右长件优先带 3-4 米短宽件；低矮小件可进入超限车集中合装；乌兹别克线路禁止多件合装超过 44 吨，俄罗斯等其他线路按当地规则人工复核。',
        '俄罗斯工业件规则：宽 3000-3200mm、高约 3250mm 且重量可控时，优先 17米6轴平板办理超限证；窄小重货优先 6轴篷布集中。',
        '俄罗斯篷布边界规则：宽 2400mm 左右、高 2500mm 内优先篷布；宽 3100mm+ 或高 3200mm+ 优先平板；篷布并排估算宽度超过 3300mm 必须改平板或人工复核。',
        '俄罗斯长货批量规则：不经过乌兹别克时，24 米以上窄长货按同长度段、累计宽度约 3000mm 合装超限车；超过 44 吨时强制提示人工复核。',
        '俄罗斯超限合装成本规则：到俄罗斯且不经过乌兹别克时，可将多件宽高重货集中到一台超限车办理，剩余普通货优先用 13.6米6轴平板压缩车数；必须复核轴荷、证件、路线、绑扎和车辆承载等级。',
        '本次升级：装载方案按整票总体成本评估，不按单台车成本贪心选择；中等大件优先尝试 17米6轴平板并车减少总车辆数，剩余小件再用篷布车收尾。',
        isRussiaDestination(options) ? '俄罗斯成本规则：先拆出宽货/高货/长货平板处理，其余优先低成本篷布车；宽度 2500mm 以上和高度 3300mm 以上自动标记复核超限费或车货总高。' : '',
        (options.destinationCountries ?? [options.destinationCountry]).some((country) => country === '俄罗斯') ? `国家规则：俄罗斯车辆+货物总高不得超过 ${(activeLoadingRules.russiaMaxVehicleCargoHeightMm / 1000).toFixed(1)} 米；系统按货物有效高度 ${(activeLoadingRules.russiaCargoHeightLimitMm / 1000).toFixed(1)} 米自动校验。` : '',
        `受力规则：货物重量/承载长度超过 ${activeLoadingRules.deckPressureLimitKgPerMm}kg/mm 时，普通平板木底板受力不足，必须使用特种板。`,
        `平板车旋转横置规则：普通平板车、特种平板车横置后的占车宽不得超过 ${activeLoadingRules.rotatedLoadMaxWidthMm}mm；超过则不按横置方案缩短装载长度。`,
      ].filter(Boolean),
    };
  } finally {
    activeLoadingRules = previousRules;
  }
}

export function formatLoadingPlan(plan: LoadingPlan) {
  const lines = [
    plan.title,
    `生成时间：${new Date(plan.createdAt).toLocaleString()}`,
    `车辆数量：${plan.summary.vehicleCount}`,
    `已配载：${plan.summary.assignedQuantity}/${plan.summary.totalCargoQuantity} 件`,
    `重量：${plan.summary.assignedWeightKg.toFixed(2)}/${plan.summary.totalWeightKg.toFixed(2)} kg`,
    `方数：${plan.summary.assignedVolumeCbm.toFixed(3)}/${plan.summary.totalVolumeCbm.toFixed(3)} m3`,
    '',
  ];
  for (const vehicle of plan.vehicles) {
    lines.push(
      `车辆：${vehicle.vehicle.category} / ${vehicle.vehicle.name}，${vehicle.vehicle.lineCount ?? '-'}线${vehicle.vehicle.axleCount ?? '-'}轴`,
      `装载方式：${vehicle.loadingMethod}`,
      `利用率：载重 ${vehicle.weightUtilization}% / 方数 ${vehicle.volumeUtilization}% / 最大货长 ${vehicle.maxLengthCm}mm`,
    );
    for (const assignment of vehicle.assignments) {
      lines.push(`- ${assignment.boxNo} ${assignment.cargoName} x ${assignment.quantity}，${assignment.weightKg.toFixed(2)}kg，${assignment.volumeCbm.toFixed(3)}m3`);
      if (assignment.notes.length) {
        lines.push(`  提醒：${assignment.notes.join('；')}`);
      }
    }
    if (vehicle.warnings.length) {
      lines.push(`车辆提醒：${vehicle.warnings.join('；')}`);
    }
    lines.push('');
  }
  if (plan.unassigned.length) {
    lines.push('未配载货物');
    for (const item of plan.unassigned) {
      lines.push(`- ${item.cargo.boxNo} ${item.cargo.name} x ${item.quantity}：${item.reasons.join('；')}`);
    }
  }
  return lines.join('\n');
}

