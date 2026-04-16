import { MATERIALS_CATALOG, SYSTEMS_CATALOG } from "@/constants/catalog";

export interface Dimensions {
  largo: number;
  ancho: number;
  espesor: number;
  alto: number;
}

export interface DosageSelection {
  resistencia: "H-20" | "H-25" | "H-30";
  secado: "Estándar" | "R-7";
  armaduraTipo: "ACMA" | "Tradicional";
  armaduraDetalle: string;
  aditivos?: string[]; 
  vaciado?: "Directa" | "Bomba Pluma" | "Bomba Estacionaria";
  mezclado?: "Planta (Mixer)" | "Obra (Trompo)";
  acabado?: "Platachado" | "Helicóptero" | "Escobillado";
}

export interface MaterialLine {
  id: string;
  name: string;
  unit: string;
  baseQuantity: number;
  quantity: number;
  price: number;
  total: number;
  category: string;
}

export interface CostBreakdown {
  materials: number;
  labor: number;
  costoDirecto: number;
  gg: number;
  profit: number;
  total: number;
  volume: number;
}

export const calculateGeometricData = (dims: Dimensions, systemId: string | null) => {
  const { largo, ancho, espesor, alto } = dims;
  const sys = SYSTEMS_CATALOG.find(s => s.id === systemId);
  
  let area = largo * ancho;
  if (sys?.baseUnit === 'mt' || sys?.baseUnit === 'm') area = largo;
  if (sys?.category === 'Estructuras' || sys?.category === 'Tabiquería' || sys?.name.toLowerCase().includes("muro")) {
    area = largo * alto;
  }
  
  const volume = Math.round(area * espesor * 10000) / 10000;
  
  return { area, volume };
};

export const calculateMaterialQuantities = (
  systemId: string | null, 
  dims: Dimensions,
  prices: Record<string, number>,
  wasteMargin: number = 0,
  dosage?: DosageSelection
): MaterialLine[] => {
  if (!systemId) return [];
  const system = SYSTEMS_CATALOG.find(s => s.id === systemId);
  if (!system) return [];

  const { area, volume } = calculateGeometricData(dims, systemId);
  const base = system.baseUnit === 'm2' ? area : (system.baseUnit === 'mt' || system.baseUnit === 'm' ? area : volume);

  let materialIds = [...system.materialIds];

  if (dosage && system.category === "Obra Gruesa") {
    // 1. Lógica Mezclado (Mixer vs Obra)
    if (dosage.mezclado === "Obra (Trompo)") {
        // Remover hormigón premezclado
        materialIds = materialIds.filter(id => !id.startsWith("horm_"));
        // Asegurar que arena y gravilla estén
        if (!materialIds.includes("arena_m3")) materialIds.push("arena_m3");
        if (!materialIds.includes("gravilla_m3")) materialIds.push("gravilla_m3");
        if (!materialIds.includes("cem_saco")) materialIds.push("cem_saco");
    } else {
        // Modo Mixer: Reemplazar con resistencia específica
        const concreteId = dosage.resistencia === "H-20" ? "horm_h20" : (dosage.resistencia === "H-25" ? "horm_h25" : "horm_h30");
        materialIds = materialIds.filter(id => !id.startsWith("horm_") && id !== "arena_m3" && id !== "gravilla_m3" && id !== "cem_saco");
        materialIds.push(concreteId);
    }

    // 2. Reemplazar Armadura
    materialIds = materialIds.filter(id => !id.startsWith("malla_") && !id.startsWith("fierro_"));
    materialIds.push(dosage.armaduraDetalle);

    // 3. Inyectar Aditivos
    if (dosage.aditivos) {
        dosage.aditivos.forEach(a => {
            if (a === 'impermeabilizante' && !materialIds.includes('adit_imper')) materialIds.push('adit_imper');
            if (a === 'fibra' && !materialIds.includes('adit_fibra')) materialIds.push('adit_fibra');
            if (a === 'retardante' && !materialIds.includes('adit_retar')) materialIds.push('adit_retar');
        });
    }

    // 4. Inyectar Servicios de Bombeo
    if (dosage.vaciado && dosage.vaciado !== "Directa") {
        if (!materialIds.includes("serv_bomba")) materialIds.push("serv_bomba");
    }

    // 5. Inyectar Acabados
    if (dosage.acabado === "Helicóptero") materialIds.push("acab_heli");
    if (dosage.acabado === "Escobillado") materialIds.push("acab_escob");
  }

  return materialIds.map(mid => {
    const mat = MATERIALS_CATALOG.find(m => m.id === mid);
    if (!mat) return null;

    const safetyFactor = 1 + wasteMargin;
    
    // Ajuste de coberturas especiales para mezcla en obra (Cantidad por m3 de hormigón)
    let coverage = mat.coverage;
    if (dosage?.mezclado === "Obra (Trompo)") {
        if (mat.id === "cem_saco") coverage = 8.5; // sacos por m3
        if (mat.id === "arena_m3") coverage = 0.65;
        if (mat.id === "gravilla_m3") coverage = 0.85;
    }

    // Los acabados se calculan por m2, no por m3
    const calculationBase = (mat.id.startsWith("acab_")) ? area : base;

    const qty = calculationBase * coverage * safetyFactor;
    let price = prices[mat.id] || mat.refPrice;

    if (dosage?.secado === "R-7" && mat.category === "Hormigones" && mat.id.startsWith("horm_")) {
      price = price * 1.20;
    }

    return {
      id: mat.id,
      name: mat.name + (dosage?.secado === "R-7" && mat.id.startsWith("horm_") ? " (R-7)" : ""),
      unit: mat.unit,
      baseQuantity: calculationBase * coverage,
      quantity: qty,
      price: Math.round(price),
      total: Math.round(qty * price),
      category: mat.category
    };
  }).filter(Boolean) as MaterialLine[];
};

export const calculateTotalCost = (
  systemId: string | null,
  dims: Dimensions,
  materials: MaterialLine[]
): CostBreakdown => {
  if (!dims.largo || dims.largo <= 0) {
    return { materials: 0, labor: 0, costoDirecto: 0, gg: 0, profit: 0, total: 0, volume: 0 };
  }

  const matTotal = materials.reduce((a, m) => a + m.total, 0);
  const { area, volume } = calculateGeometricData(dims, systemId);
  const sys = SYSTEMS_CATALOG.find(s => s.id === systemId);
  
  const baseValue = sys?.baseUnit === 'm2' ? area : (sys?.baseUnit === 'mt' || sys?.baseUnit === 'm' ? area : volume);
  
  const labor = Math.round(baseValue * (sys?.laborRate || 0));
  const direct = matTotal + labor;
  const gg = Math.round(direct * 0.12); 
  const profit = Math.round((direct + gg) * 0.15);

  return { 
    materials: matTotal, 
    labor, 
    costoDirecto: direct, 
    gg, 
    profit, 
    total: Math.round(direct + gg + profit),
    volume
  };
};
