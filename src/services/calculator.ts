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
  total: number;
}

export const calculateGeometricData = (dims: Dimensions, systemId: string | null) => {
  const { largo, ancho, espesor, alto } = dims;
  const sys = SYSTEMS_CATALOG.find(s => s.id === systemId);
  const area = (sys?.id === "tabique_st") ? largo * alto : largo * ancho;
  return { area, volume: area * espesor };
};

export const calculateMaterialQuantities = (
  systemId: string | null, 
  dims: Dimensions,
  prices: Record<string, number>
): MaterialLine[] => {
  if (!systemId) return [];
  const system = SYSTEMS_CATALOG.find(s => s.id === systemId);
  if (!system) return [];

  const { area, volume } = calculateGeometricData(dims, systemId);
  const base = system.baseUnit === 'm2' ? area : volume;

  return system.materialIds.map(mid => {
    const mat = MATERIALS_CATALOG.find(m => m.id === mid);
    if (!mat) return null;

    const isHormigon = mat.name.toLowerCase().includes("hormigón") || mat.name.toLowerCase().includes("arena");
    const isMalla = mat.name.toLowerCase().includes("malla") || mat.name.toLowerCase().includes("acma");
    const factor = isHormigon ? 1.07 : isMalla ? 1.10 : 1.0;
    
    const qty = base * mat.coverage * factor;
    const price = prices[mat.id] || mat.refPrice;

    return {
      id: mat.id,
      name: mat.name,
      unit: mat.unit,
      baseQuantity: base * mat.coverage,
      quantity: qty,
      price,
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
  if (!dims.espesor || dims.espesor <= 0) {
    return { materials: 0, labor: 0, costoDirecto: 0, gg: 0, profit: 0, total: 0 };
  }

  const matTotal = materials.reduce((a, m) => a + m.total, 0);
  const { area, volume } = calculateGeometricData(dims, systemId);
  const sys = SYSTEMS_CATALOG.find(s => s.id === systemId);
  
  const labor = Math.round((sys?.baseUnit === 'm2' ? area : volume) * (sys?.laborRate || 0));
  const direct = matTotal + labor;
  const gg = direct * 0.12; 
  const profit = (direct + gg) * 0.15;

  return { 
    materials: matTotal, 
    labor, 
    costoDirecto: direct, 
    gg, 
    profit, 
    total: Math.round(direct + gg + profit) 
  };
};
