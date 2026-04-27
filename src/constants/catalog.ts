export type Material = {
  id: string;
  name: string;
  category: "Preliminares" | "Obra Gruesa" | "Techumbres" | "Terminaciones" | "Instalaciones" | "Otros";
  unit: "un" | "cajas" | "m2" | "m3" | "mt" | "sacos" | "kg" | "Global" | "L";
  coverage: number; 
  refPrice: number; 
  tags: string[];
};

export const MATERIALS_CATALOG: Material[] = [
  // CAP 1. OBRAS PRELIMINARES
  { id: "pre_inst_faena", name: "Instalación de Faenas (Bodega/Baño)", category: "Preliminares", unit: "Global", coverage: 1, refPrice: 450000, tags: ["preliminar", "instalacion"] },
  { id: "pre_cierre_prov", name: "Cierro Provisorio (OSB/Pino)", category: "Preliminares", unit: "mt", coverage: 1, refPrice: 12500, tags: ["preliminar", "cierre"] },
  { id: "pre_trazado", name: "Trazado y Niveles (NCh 348)", category: "Preliminares", unit: "m2", coverage: 1, refPrice: 2800, tags: ["preliminar", "trazado"] },

  // CAP 2. OBRA GRUESA
  { id: "excav_man", name: "Excavación Manual", category: "Obra Gruesa", unit: "m3", coverage: 1, refPrice: 18500, tags: ["excavacion"] },
  { id: "estab_comp", name: "Estabilizado Compactado 10cm", category: "Obra Gruesa", unit: "m3", coverage: 0.12, refPrice: 24500, tags: ["terreno", "base"] },
  { id: "horm_g20", name: "Hormigón Grado G20 (Fundaciones)", category: "Obra Gruesa", unit: "m3", coverage: 1, refPrice: 125000, tags: ["hormigon", "nch170"] },
  { id: "horm_g25", name: "Hormigón Grado G25 (Radier)", category: "Obra Gruesa", unit: "m3", coverage: 1, refPrice: 138000, tags: ["hormigon", "nch170"] },
  { id: "horm_g30", name: "Hormigón Grado G30 (Vigas/Pilares)", category: "Obra Gruesa", unit: "m3", coverage: 1, refPrice: 152000, tags: ["hormigon", "nch170"] },
  { id: "acero_a63_42h", name: "Acero A63-42H (Enfierradura)", category: "Obra Gruesa", unit: "kg", coverage: 1, refPrice: 1450, tags: ["acero", "nch430"] },
  { id: "malla_acma_c92", name: "Malla ACMA C-92 (2.6x5m)", category: "Obra Gruesa", unit: "un", coverage: 0.08, refPrice: 38500, tags: ["acero", "radier"] },
  { id: "nylon_01", name: "Barrera Humedad Nylon 0.1", category: "Obra Gruesa", unit: "m2", coverage: 1.15, refPrice: 850, tags: ["humedad", "radier"] },
  { id: "sep_enfierr", name: "Separadores de Enfierradura", category: "Obra Gruesa", unit: "un", coverage: 4, refPrice: 250, tags: ["enfierradura"] },
  { id: "mold_terc", name: "Moldaje Terciado Estructural", category: "Obra Gruesa", unit: "m2", coverage: 0.35, refPrice: 28000, tags: ["moldaje"] },

  // CAP 3. TECHUMBRES
  { id: "tech_cercha_mad", name: "Cercha Madera Pino Grado 2", category: "Techumbres", unit: "un", coverage: 0.15, refPrice: 32000, tags: ["techumbre", "madera"] },
  { id: "tech_metalcom", name: "Estructura Metalcom C/U", category: "Techumbres", unit: "mt", coverage: 2.5, refPrice: 4200, tags: ["techumbre", "metalcom"] },
  { id: "tech_zinc_04", name: "Zinc-Alum 0.4mm", category: "Techumbres", unit: "m2", coverage: 1.15, refPrice: 9200, tags: ["cubierta", "zinc"] },
  { id: "tech_aisl_lana", name: "Lana de Vidrio (Aislación)", category: "Techumbres", unit: "m2", coverage: 1.05, refPrice: 4500, tags: ["aislacion", "pda"] },

  // CAP 4. TERMINACIONES
  { id: "term_volc_st", name: "Volcanita ST 10mm", category: "Terminaciones", unit: "un", coverage: 0.35, refPrice: 7900, tags: ["tabique"] },
  { id: "term_volc_rh", name: "Volcanita RH 12.5mm (Verde)", category: "Terminaciones", unit: "un", coverage: 0.35, refPrice: 13500, tags: ["tabique", "baño"] },
  { id: "term_piso_flot", name: "Piso Flotante 8mm", category: "Terminaciones", unit: "m2", coverage: 1.05, refPrice: 12500, tags: ["pavimento"] },
  { id: "term_bekron_ac", name: "Adhesivo Bekron AC", category: "Terminaciones", unit: "sacos", coverage: 0.25, refPrice: 14500, tags: ["adhesivo", "baño"] },
  { id: "term_latex", name: "Pintura Látex (Cielos)", category: "Terminaciones", unit: "L", coverage: 0.15, refPrice: 18500, tags: ["pintura"] },

  // CAP 5. INSTALACIONES
  { id: "inst_pvc_110", name: "Tubería PVC 110mm Sanitario", category: "Instalaciones", unit: "mt", coverage: 1, refPrice: 5200, tags: ["sanitaria"] },
  { id: "inst_ppr_20", name: "Cañería PPR 20mm Agua", category: "Instalaciones", unit: "mt", coverage: 1, refPrice: 3800, tags: ["hidraulica"] },
  { id: "inst_cable_eva", name: "Cable Eléctrico EVA (Verde/Blanco)", category: "Instalaciones", unit: "mt", coverage: 1, refPrice: 1200, tags: ["electrica"] },
];

export const SYSTEMS_CATALOG: ConstructionSystem[] = [
  {
    id: "radier_completo",
    category: "Obra Gruesa",
    name: "Radier Completo AEC (Hormigón + ACMA + Nylon)",
    subType: "Base Estabilizada + G25",
    baseUnit: "m2",
    materialIds: ["estab_comp", "nylon_01", "malla_acma_c92", "horm_g25", "sep_enfierr"],
    laborRate: 18500,
    performance: 15,
    squad: "1 Maestro + 2 Ayudantes",
    tags: ["radier", "maestra", "nch170"]
  },
  {
    id: "tabique_rh",
    category: "Terminaciones",
    name: "Tabiquería RH (Baños/Zonas Húmedas)",
    subType: "Metalcom + Volcanita RH",
    baseUnit: "m2",
    materialIds: ["term_volc_rh", "term_bekron_ac"],
    laborRate: 14500,
    performance: 12,
    squad: "1 Maestro + 1 Ayudante",
    tags: ["baño", "rh", "volcanita"]
  },
  {
    id: "techumbre_aislada",
    category: "Techumbres",
    name: "Techumbre Completa PDA",
    subType: "Zinc + Lana de Vidrio",
    baseUnit: "m2",
    materialIds: ["tech_cercha_mad", "tech_zinc_04", "tech_aisl_lana"],
    laborRate: 22500,
    performance: 10,
    squad: "1 Maestro + 2 Ayudantes",
    tags: ["techumbre", "aislacion", "pda"]
  }
];

export type ConstructionSystem = {
  id: string;
  category: "Preliminares" | "Obra Gruesa" | "Techumbres" | "Terminaciones" | "Instalaciones" | string;
  name: string;
  subType?: string;
  baseUnit: "m" | "m2" | "m3" | "mt";
  materialIds: string[];
  laborRate: number; 
  performance: number; 
  squad: string;
  tags: string[];
};
