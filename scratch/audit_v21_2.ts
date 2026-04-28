import { validateAECBounds, calculateMaterialQuantities, calculateTotalCost } from "../src/services/calculator";
import { SYSTEMS_CATALOG } from "../src/constants/catalog";

console.log("=== INICIANDO AUDITORÍA DE SISTEMAS AEC-CHILE ===\n");

// 1. VALIDACIÓN DE CATÁLOGO Y FACTORES DE PÉRDIDA
console.log("--- 1. CASCADA COMERCIAL Y PÉRDIDAS ---");
const radierDims = { largo: 5, ancho: 4, espesor: 0.1, alto: 0 }; // 20m2
const radierMats = calculateMaterialQuantities("radier_completo", radierDims);
const radierCost = calculateTotalCost("radier_completo", radierDims, radierMats);

const hormigon = radierMats.find(m => m.id === "horm_g25");
console.log(`Hormigón G25 (5% Pérdida esperada): Base=${hormigon?.baseQuantity}, Final=${hormigon?.quantity.toFixed(2)} -> Pérdida Aplicada: ${hormigon ? ((hormigon.quantity / hormigon.baseQuantity) - 1) * 100 : 0}%`);

const techumbreDims = { largo: 5, ancho: 4, espesor: 0, alto: 0 }; // 20m2
const techMats = calculateMaterialQuantities("techumbre_aislada", techumbreDims);
const madera = techMats.find(m => m.id === "tech_cercha_mad");
console.log(`Cercha Madera (15% Pérdida esperada): Base=${madera?.baseQuantity}, Final=${madera?.quantity.toFixed(2)} -> Pérdida Aplicada: ${madera ? ((madera.quantity / madera.baseQuantity) - 1) * 100 : 0}%`);

console.log("\nCascada Comercial Radier:");
console.log(`- Costo Directo: $${radierCost.costoDirecto}`);
console.log(`- GG (12%): $${radierCost.gg}`);
console.log(`- Utilidad (15%): $${radierCost.profit}`);
console.log(`- IVA (19%): $${radierCost.iva}`);
console.log(`- TOTAL: $${radierCost.total}`);

// 2. VALIDACIÓN DE LÍMITES DE INGENIERÍA
console.log("\n--- 2. LÍMITES DE INGENIERÍA ---");
const fallasRadier = validateAECBounds("radier_completo", { largo: 5, ancho: 4, espesor: 0.05, alto: 0 });
console.log(`Radier 5cm (Falla esperada):`, fallasRadier.length > 0 ? "⚠️ BLOQUEADO" : "❌ ERROR DE FILTRO", fallasRadier);

const fallasTabique = validateAECBounds("tabique_rh", { largo: 5, ancho: 0.1, espesor: 0.1, alto: 3.5 });
console.log(`Tabique 3.5m Alto (Falla esperada):`, fallasTabique.length > 0 ? "⚠️ BLOQUEADO" : "❌ ERROR DE FILTRO", fallasTabique);

const fallasTechumbre = validateAECBounds("techumbre_aislada", { largo: 10, ancho: 9, espesor: 0, alto: 0 });
console.log(`Techumbre Luz 9m (Falla esperada):`, fallasTechumbre.length > 0 ? "⚠️ BLOQUEADO" : "❌ ERROR DE FILTRO", fallasTechumbre);

const exitoRadier = validateAECBounds("radier_completo", { largo: 5, ancho: 4, espesor: 0.1, alto: 0 });
console.log(`Radier 10cm (Éxito esperado):`, exitoRadier.length === 0 ? "✅ APROBADO" : "❌ ERROR", exitoRadier);

console.log("\n=== AUDITORÍA FINALIZADA ===");
