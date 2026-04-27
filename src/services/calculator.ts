import { MATERIALS_CATALOG, SYSTEMS_CATALOG } from "@/constants/catalog";

export interface Dimensions {
  largo: number;
  ancho: number;
  espesor: number;
  alto: number;
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
  iva: number;
  total: number;
  volume: number;
}

export const calculateGeometricData = (dims: Dimensions, systemId: string | null) => {
  const { largo, ancho, espesor, alto } = dims;
  const sys = SYSTEMS_CATALOG.find(s => s.id === systemId);
  
  let area = largo * ancho;
  if (sys?.baseUnit === 'mt' || sys?.baseUnit === 'm') area = largo;
  if (sys?.category === 'Terminaciones' || sys?.name.toLowerCase().includes("muro")) {
    area = largo * (alto || 2.4);
  }
  
  const volume = Math.round(area * (espesor || 0.1) * 10000) / 10000;
  
  return { area, volume };
};

export const calculateMaterialQuantities = (
  systemId: string | null, 
  dims: Dimensions,
  prices: Record<string, number> = {}
): MaterialLine[] => {
  if (!systemId) return [];
  const system = SYSTEMS_CATALOG.find(s => s.id === systemId);
  if (!system) return [];

  const { area, volume } = calculateGeometricData(dims, systemId);
  const base = system.baseUnit === 'm2' ? area : (system.baseUnit === 'mt' || system.baseUnit === 'm' ? area : volume);

  return system.materialIds.map(mid => {
    const mat = MATERIALS_CATALOG.find(m => m.id === mid);
    if (!mat) return null;

    // Lógica Senior de Factores de Pérdida AEC-CHILE
    let wasteFactor = 1.05; // 5% base para Hormigones/Acero
    if (mat.category === "Techumbres" || mat.id.includes("madera") || mat.id.includes("pino")) {
        wasteFactor = 1.15; // 15% para Techumbres y cortes de madera
    }

    const qty = base * mat.coverage * wasteFactor;
    const price = prices[mat.id] || mat.refPrice;

    return {
      id: mat.id,
      name: mat.name,
      unit: mat.unit,
      baseQuantity: base * mat.coverage,
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
  const matTotal = materials.reduce((a, m) => a + m.total, 0);
  const { area, volume } = calculateGeometricData(dims, systemId);
  const sys = SYSTEMS_CATALOG.find(s => s.id === systemId);
  
  const baseValue = sys?.baseUnit === 'm2' ? area : (sys?.baseUnit === 'mt' || sys?.baseUnit === 'm' ? area : volume);
  
  // 1. COSTO DIRECTO (Suma de APU)
  const labor = Math.round(baseValue * (sys?.laborRate || 0));
  const direct = matTotal + labor;

  // 2. GASTOS GENERALES (12%)
  const gg = Math.round(direct * 0.12);

  // 3. UTILIDAD (15%)
  const profit = Math.round((direct + gg) * 0.15);

  // 4. IVA (19%) - Obligatorio
  const subtotal = direct + gg + profit;
  const iva = Math.round(subtotal * 0.19);

  return { 
    materials: matTotal, 
    labor, 
    costoDirecto: direct, 
    gg, 
    profit, 
    iva,
    total: Math.round(subtotal + iva),
    volume
  };
};

export const validateAECBounds = (systemId: string | null, dims: Dimensions): string[] => {
  const warnings: string[] = [];
  if (!systemId) return warnings;

  // Límite de ingeniería para radier
  if (systemId.includes('radier')) {
    if (dims.espesor < 0.07 || dims.espesor > 0.20) {
      warnings.push("Esa medida no cumple con estándares de seguridad, ¿estás seguro? (El espesor normativo es 7cm a 20cm)");
    }
  }

  // Límite de ingeniería para tabiques (Altura estructural máxima 3m)
  if (systemId.includes('tabique')) {
    if (dims.alto && (dims.alto < 2.0 || dims.alto > 3.0)) {
      warnings.push("Esa medida no cumple con estándares de seguridad, ¿estás seguro? (La altura máxima de tabique sin refuerzo es 3.0m)");
    }
  }

  // Límite de ingeniería para techumbre (Luz máxima cercha estándar 8m)
  if (systemId.includes('techumbre')) {
    const luzMaxima = Math.min(dims.largo, dims.ancho);
    if (luzMaxima > 8.0) {
      warnings.push("Esa medida no cumple con estándares de seguridad, ¿estás seguro? (Luces mayores a 8m exigen reticulado especial o vigas maestras)");
    }
  }

  return warnings;
};
