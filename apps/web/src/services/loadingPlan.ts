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

function placementLengthMm(cargo: CargoItem) {
  const longSide = Math.max(cargo.lengthCm, cargo.widthCm);
  const shortSide = Math.min(cargo.lengthCm, cargo.widthCm);
  if (!cargo.allowRotate) return cargo.lengthCm;
  // Road transport cannot rotate a long beam so that its long side becomes vehicle width.
  // Only compact cargo whose long side can still fit within normal deck width may use the shorter placement length.
  if (longSide > 2_550 && shortSide <= 2_550) return longSide;
  return shortSide;
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
  return sumWeight(items) <= activeLoadingRules.flatbedWeightLimitKg && items.every((item) => item.weightKg <= activeLoadingRules.flatbedWeightLimitKg);
}

function floorPlanLengthMm(items: CargoItem[], usableWidthMm = activeLoadingRules.flatbedDeckWidthMm) {
  const areaLength = items.reduce((sum, item) => sum + placementLengthMm(item) * item.widthCm, 0) / usableWidthMm;
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
    cargo.widthCm <= activeLoadingRules.flatbedSoftWidthMm &&
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
  return items.reduce((max, item) => Math.max(max, item.widthCm), 0);
}

function hasOversizeDimension(cargo: CargoItem) {
  return (
    cargo.widthCm > activeLoadingRules.oversizeWidthMm ||
    cargo.heightCm > activeLoadingRules.oversizeHeightMm ||
    cargo.lengthCm > 13_600
  );
}

function isHeavyForFlatbed(cargo: CargoItem) {
  return cargo.weightKg > activeLoadingRules.flatbedWeightLimitKg;
}

function shouldPreferOversize(cargo: CargoItem) {
  return (
    isHeavyForFlatbed(cargo) ||
    cargo.widthCm >= activeLoadingRules.oversizeWidthMm ||
    cargo.heightCm >= 3_800 ||
    (cargo.widthCm >= activeLoadingRules.oversizeCandidateWidthMm && cargo.weightKg >= activeLoadingRules.flatbedWeightLimitKg)
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

function chooseOversizeVehicle(vehicles: LoadingVehicle[], items: CargoItem[]) {
  const text = items.map((item) => `${item.name} ${item.remark ?? ''}`).join(' ');
  const width = maxWidth(items);
  const height = items.reduce((max, item) => Math.max(max, item.heightCm), 0);
  const requiredWeight = sumWeight(items);
  const oversizeVehicles = vehicles.filter(isOversizeVehicle);
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
  return sumWeight(next) <= activeLoadingRules.indivisibleSingleVehicleKg && sumVolume(next) <= 240 && next.length <= maxItems;
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
      chooseVehicle(vehicles, (candidate) => isFlatbedVehicle(candidate) && item.weightKg <= activeLoadingRules.flatbedWeightLimitKg, item.weightKg) ??
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
  if (isFlatbedVehicle(vehicle) && lengthMm && placementLengthMm(cargo) > lengthMm) {
    notes.push(`超出平板有效长度 ${lengthMm}mm，需申请超长证`);
  }
  if (widthMm && cargo.widthCm > widthMm) {
    notes.push(`超出车辆有效宽度 ${widthMm}mm，需复核超宽证或更换车型`);
  }
  if (heightMm && cargo.heightCm > heightMm) {
    notes.push(`超出车辆有效高度 ${heightMm}mm，需复核限高或更换车型`);
  }
  if (cargo.widthCm > activeLoadingRules.oversizeWidthMm) {
    notes.push(`宽度 ${cargo.widthCm}mm，需复核超宽许可`);
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
    warnings.push(`多件合装总重超过 ${activeLoadingRules.indivisibleSingleVehicleKg}kg，不符合中亚 44 吨规则`);
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
      const cargoHeightLimit = vehicleHeightMm(vehicle.vehicle);
      if (cargoHeightLimit) {
        const maxCargoHeight = Math.max(...vehicle.assignments.map((assignment) => Number(assignment.heightCm ?? 0)), 0);
        if (maxCargoHeight && maxCargoHeight > cargoHeightLimit) {
          warnings.push(`俄罗斯规则：车辆+货物总高不得超过 ${activeLoadingRules.russiaMaxVehicleCargoHeightMm}mm；按当前车型有效高度 ${cargoHeightLimit}mm，货物最高 ${maxCargoHeight}mm，需更换车型或重新配载。`);
        }
        if (!maxCargoHeight) {
          warnings.push(`俄罗斯规则：车辆+货物总高不得超过 ${activeLoadingRules.russiaMaxVehicleCargoHeightMm}mm，需结合货物高度和车辆空载高度复核。`);
        }
      } else {
        warnings.push(`俄罗斯规则：车辆+货物总高不得超过 ${activeLoadingRules.russiaMaxVehicleCargoHeightMm}mm；当前车型未配置有效高度，需按车辆空载高度+货物高度人工复核。`);
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
  try {
    const units = expandCargo(cargoItems);
    const projectBatch = buildProjectBatchBins(units, selectedVehicles);
    const oversize = buildOversizeBins(projectBatch.rest, selectedVehicles);
    const flatbed = buildFlatbedConsolidationBins(oversize.rest, selectedVehicles);
    const tarp = buildTarpBins(flatbed.rest, selectedVehicles);
    const fallback = buildFallbackBins(tarp.rest, selectedVehicles);
    const bins = [...projectBatch.bins, ...oversize.bins, ...flatbed.bins, ...tarp.bins, ...fallback.bins];
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
        `当前规则：项目批量货物优先按 17米5轴平板矩阵摆放；不可摆放表示不能被压，不影响同车并排；空白要求默认允许叠放；除非单件且不可拆分，否则单车总重不能超过 ${activeLoadingRules.indivisibleSingleVehicleKg}kg；单件超过 ${activeLoadingRules.indivisibleSingleVehicleKg}kg 的不可拆分货物必须单独一车。`,
        '本次升级：装载方案按整票总体成本评估，不按单台车成本贪心选择；中等大件优先尝试 17米6轴平板并车减少总车辆数，剩余小件再用篷布车收尾。',
        (options.destinationCountries ?? [options.destinationCountry]).some((country) => country === '俄罗斯') ? `国家规则：俄罗斯车辆+货物总高不得超过 ${(activeLoadingRules.russiaMaxVehicleCargoHeightMm / 1000).toFixed(1)} 米；车型有效高度建议按“总高上限-车辆空载高度/板高”维护，用于系统自动校验。` : '',
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

