import { calculateMaterialQuantities, calculateTotalCost } from "./src/services/calculator";
import { SYSTEMS_CATALOG } from "./src/constants/catalog";

const dims = { largo: 5, ancho: 4, espesor: 0.1, alto: 0 }; // 20m2
const systemId = "radier_completo";
const materials = calculateMaterialQuantities(systemId, dims);
const breakdown = calculateTotalCost(systemId, dims, materials);

console.log("=== RADIER COMPLETO AEC (20m2) ===");
console.log(JSON.stringify({
  partida: "Radier Completo AEC",
  dimensiones: "20m2 (e=10cm)",
  materiales_detalle: materials.map(m => ({
    material: m.name,
    cantidad_neta: m.baseQuantity.toFixed(2),
    factor_perdida: m.category === "Techumbres" ? "15%" : "5%",
    cantidad_final: m.quantity.toFixed(2),
    unidad: m.unit,
    precio_ref: m.price,
    subtotal: m.total
  })),
  analisis_costos: {
    costo_directo: breakdown.costoDirecto,
    gastos_generales_12: breakdown.gg,
    utilidad_15: breakdown.profit,
    iva_19: breakdown.iva,
    total_final: breakdown.total
  }
}, null, 2));
