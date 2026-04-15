export type Material = {
  id: string;
  name: string;
  category: "Planchas" | "Perfiles" | "Fijaciones" | "Hormigones" | "Aislación" | "Maderas" | "Otros";
  unit: "un" | "cajas" | "m2" | "m3" | "mt" | "sacos" | "kg" | "Global" | "L";
  coverage: number; // Por m2 o m3
  refPrice: number; // Precio base CLP
  tags: string[];
};

export const MATERIALS_CATALOG: Material[] = [
  // PLANCHAS
  { id: "v_st_10", name: "Volcanita ST 10mm (1.2x2.4)", category: "Planchas", unit: "un", coverage: 0.35, refPrice: 7800, tags: ["tabique", "cielo"] },
  { id: "v_rh_12", name: "Volcanita RH 12.5mm (1.2x2.4)", category: "Planchas", unit: "un", coverage: 0.35, refPrice: 12500, tags: ["tabique", "baño", "cocina"] },
  { id: "osb_9", name: "Placa OSB 9mm (1.22x2.44)", category: "Planchas", unit: "un", coverage: 0.34, refPrice: 11500, tags: ["cierre", "perimetral", "provissorio"] },
  { id: "zinc_ond", name: "Zinc Ondulado 0.35mm 3.6mt", category: "Planchas", unit: "un", coverage: 0.30, refPrice: 9500, tags: ["cierre", "techo", "provisorio"] },
  { id: "pv4", name: "Panel PV4 Prepintado 0.4mm", category: "Planchas", unit: "m2", coverage: 1.05, refPrice: 8500, tags: ["techo", "cubierta", "techumbre"] },
  
  // PERFILES Y MADERAS
  { id: "mont_60", name: "Montante Metalcon 60x38x0.5mm 3mt", category: "Perfiles", unit: "mt", coverage: 0.85, refPrice: 3200, tags: ["tabique", "metalcon"] },
  { id: "canal_60", name: "Canal Metalcon 60x38x0.5mm 3mt", category: "Perfiles", unit: "mt", coverage: 0.45, refPrice: 2800, tags: ["tabique", "metalcon"] },
  { id: "omega", name: "Perfil Omega Metalcon 3mt", category: "Perfiles", unit: "mt", coverage: 0.80, refPrice: 2500, tags: ["cielo", "revestimiento"] },
  { id: "cost_c_80", name: "Costanera C 80x40x15x2.0mm 6mt", category: "Perfiles", unit: "mt", coverage: 0.82, refPrice: 4200, tags: ["techo", "techumbre", "estructura"] },
  { id: "pino_2x3", name: "Pino Dimensionado 2x3\" 3.2mt", category: "Maderas", unit: "mt", coverage: 0.65, refPrice: 2200, tags: ["cierre", "estructura", "provisorio"] },
  { id: "pino_2x2", name: "Pino Dimensionado 2x2\" 3.2mt", category: "Maderas", unit: "mt", coverage: 0.75, refPrice: 1800, tags: ["cierre", "provisorio"] },
  
  // FIJACIONES
  { id: "torn_6x1", name: "Tornillo Drywall 6x1 (Caja 100un)", category: "Fijaciones", unit: "un", coverage: 25, refPrice: 45, tags: ["tabique", "planchas", "insumo"] },
  { id: "torn_pb_8x1/2", name: "Tornillo Punta Broca 8x1/2 (100un)", category: "Fijaciones", unit: "un", coverage: 15, refPrice: 55, tags: ["metalcon", "perfiles", "insumo"] },
  { id: "torn_techo", name: "Tornillo Techo Autoperf. 2.5\" (un)", category: "Fijaciones", unit: "un", coverage: 6, refPrice: 120, tags: ["techo", "techumbre", "zinc"] },
  { id: "tarugo_6", name: "Tarugo Nylon 6mm + Tornillo", category: "Fijaciones", unit: "un", coverage: 6, refPrice: 150, tags: ["anclaje", "muro", "insumo"] },
  { id: "cla_2", name: "Clavo Corriente 2\" (1kg)", category: "Fijaciones", unit: "kg", coverage: 0.05, refPrice: 2500, tags: ["madera", "provisorio"] },
  
  // OTROS Y AISLACIÓN
  { id: "lana_vidrio_40", name: "Lana de Vidrio 40mm R100 (Rollo)", category: "Aislación", unit: "m2", coverage: 1.05, refPrice: 2900, tags: ["tabique", "aislacion"] },
  { id: "malla_raschel", name: "Malla Raschel 80% (Verde/Negra)", category: "Otros", unit: "m2", coverage: 1.10, refPrice: 650, tags: ["cierre", "provisorio", "obras"] },
  { id: "cinta_junta", name: "Cinta de Papel Junta Invisible (75mt)", category: "Otros", unit: "mt", coverage: 0.7, refPrice: 120, tags: ["terminacion", "junta", "insumo"] },
  { id: "pasta_junta", name: "Pasta para Juntas / Masilla (Balde 5kg)", category: "Otros", unit: "kg", coverage: 0.4, refPrice: 1800, tags: ["terminacion", "junta", "insumo"] },
  
  // HORMIGONES PREMEZCLADOS (CHILE)
  { id: "horm_h20", name: "Hormigón Premezclado H20", category: "Hormigones", unit: "m3", coverage: 1.0, refPrice: 125000, tags: ["radier", "fundacion"] },
  { id: "horm_h25", name: "Hormigón Premezclado H25 (Bomba)", category: "Hormigones", unit: "m3", coverage: 1.05, refPrice: 138000, tags: ["losa", "viga", "pilar"] },
  { id: "horm_h30", name: "Hormigón Premezclado H30 (Alta Res)", category: "Hormigones", unit: "m3", coverage: 1.05, refPrice: 152000, tags: ["estructura", "critico"] },
  
  // REFUERZOS Y MALLAS
  { id: "malla_acma_c92", name: "Malla ACMA C-92 (2.6x5mt)", category: "Hormigones", unit: "un", coverage: 0.08, refPrice: 38500, tags: ["radier", "pavimento"] },
  { id: "malla_acma_c139", name: "Malla ACMA C-139 (Reforzada)", category: "Hormigones", unit: "un", coverage: 0.08, refPrice: 52000, tags: ["losa", "radier"] },
  
  // ALBAÑILERÍA ESPECIALIZADA
  { id: "lad_fiscal", name: "Ladrillo Fiscal 29x14x7cm", category: "Hormigones", unit: "un", coverage: 38, refPrice: 480, tags: ["albañilería", "muro"] },
  { id: "lad_princesa", name: "Ladrillo Princesa (Gran Formato)", category: "Hormigones", unit: "un", coverage: 42, refPrice: 650, tags: ["albañilería", "revestimiento"] },
  { id: "bloque_horm", name: "Bloque de Hormigón 19x19x39cm", category: "Hormigones", unit: "un", coverage: 12.5, refPrice: 1200, tags: ["muro", "perimetral"] },
  
  { id: "cem_esp", name: "Cemento Especial 42.5kg (Saco)", category: "Hormigones", unit: "sacos", coverage: 0.15, refPrice: 9200, tags: ["albañilería", "mortero"] },
  { id: "arena_mezcla", name: "Arena Mezcla (m3)", category: "Hormigones", unit: "m3", coverage: 0.05, refPrice: 24000, tags: ["albañilería", "mortero"] },
  { id: "fierro_8", name: "Fierro Estriado 8mm (Tira 6mt)", category: "Perfiles", unit: "un", coverage: 0.45, refPrice: 6200, tags: ["albañilería", "enfierradura"] },

  // OBRAS PRELIMINARES Y ENCOFRADOS
  { id: "excav_man", name: "Excavación Manual Terreno (0-1mt)", category: "Otros", unit: "m3", coverage: 1.0, refPrice: 18500, tags: ["preliminar", "excavacion"] },
  { id: "arena_cama", name: "Arena para Cama de Apoyo", category: "Otros", unit: "m3", coverage: 1.0, refPrice: 24000, tags: ["preliminar", "radier"] },
  { id: "film_poli", name: "Film Polietileno 0.2mm (Humedad)", category: "Otros", unit: "m2", coverage: 1.1, refPrice: 1200, tags: ["preliminar", "humedad"] },
  { id: "moldaje_mad", name: "Moldaje Madera (Pino/Terciado) + Desmoldante", category: "Otros", unit: "m2", coverage: 0.1, refPrice: 8500, tags: ["encofrado", "hormigon"] },

  // INSTALACIÓN DE FAENAS Y TERMINACIONES (PRO v2.1)
  { id: "cierre_prov", name: "Cierre Provisorio de Faena (Malla/Madera)", category: "Otros", unit: "mt", coverage: 1.0, refPrice: 4500, tags: ["faena", "preliminar"] },
  { id: "limpieza_inst", name: "Limpieza y Despeje de Faena", category: "Otros", unit: "Global", coverage: 1.0, refPrice: 35000, tags: ["faena", "limpieza"] },
  { id: "curado_liq", name: "Compuesto de Curado Químico", category: "Otros", unit: "L", coverage: 0.2, refPrice: 5800, tags: ["terminacion", "hormigon"] },
];

export type ConstructionSystem = {
  id: string;
  category: string;
  name: string;
  subType?: string;
  baseUnit: "m" | "m2" | "m3";
  materialIds: string[];
  laborRate: number; // CLP por unidad
  performance: number; // Unidades por día
  squad: string;
  tags: string[];
};

export const SYSTEMS_CATALOG: ConstructionSystem[] = [
  // FAENAS PROVISORIAS
  {
    id: "cie_prov_osb",
    category: "Cierros Provisorios",
    name: "Cierre Provisorio OSB 9mm",
    subType: "Madera + OSB",
    baseUnit: "m",
    materialIds: ["osb_9", "pino_2x3", "pino_2x2", "cla_2"],
    laborRate: 8500,
    performance: 15,
    squad: "1 Maestro + 1 Ayudante",
    tags: ["cierre", "provisorio", "madera", "osb"]
  },
  {
    id: "cie_prov_zinc",
    category: "Cierros Provisorios",
    name: "Cierre Provisorio Zinc Ondulado",
    subType: "Madera + Zinc",
    baseUnit: "m",
    materialIds: ["zinc_ond", "pino_2x3", "pino_2x2", "cla_2"],
    laborRate: 9000,
    performance: 12,
    squad: "1 Maestro + 1 Ayudante",
    tags: ["cierre", "provisorio", "madera", "zinc"]
  },
  {
    id: "cie_prov_raschel",
    category: "Cierros Provisorios",
    name: "Cierre Raschel con Polines",
    subType: "Polines + Malla",
    baseUnit: "m",
    materialIds: ["malla_raschel", "cla_2"], // Simplificado
    laborRate: 4500,
    performance: 30,
    squad: "2 Jornales",
    tags: ["malla", "provisorio", "raschel"]
  },
  // TABIQUERÍA
  { 
    id: "tabique_st", 
    category: "Tabiquería",
    name: "Tabique Metalcon ST 10mm", 
    subType: "Simple Placa",
    baseUnit: "m2", 
    materialIds: ["v_st_10", "mont_60", "canal_60", "lana_vidrio_40", "torn_6x1", "torn_pb_8x1/2", "tarugo_6", "cinta_junta", "pasta_junta"],
    laborRate: 12500,
    performance: 12,
    squad: "Maestro + Ayudante",
    tags: ["tabique", "metalcon", "volcanita"]
  },
  // CIELO FALSO
  { 
    id: "cielo_falso_st", 
    category: "Cielo Falso",
    name: "Cielo Falso Yeso-Cartón 10mm", 
    subType: "Estructura Metal",
    baseUnit: "m2", 
    materialIds: ["v_st_10", "omega", "torn_6x1", "torn_pb_8x1/2", "tarugo_6", "cinta_junta", "pasta_junta"],
    laborRate: 9500,
    performance: 18,
    squad: "Maestro + Ayudante",
    tags: ["cielo", "yeso-carton"]
  },
  // HORMIGONES
  { 
    id: "radier_estandar", 
    category: "Hormigones",
    name: "Radier de Hormigón H20 (e=10cm)", 
    subType: "Estudio de Ingeniería Completo v2.1",
    baseUnit: "m2", 
    materialIds: ["cierre_prov", "limpieza_inst", "excav_man", "arena_cama", "film_poli", "moldaje_mad", "horm_h20", "malla_acma_c92", "curado_liq"],
    laborRate: 14500, // Ajustado por terminaciones y despeje
    performance: 12, // Rendimiento más realista para proceso completo
    squad: "1 Maestro + 2 Ayudantes",
    tags: ["radier", "hormigon", "ingenieria", "pro"]
  },
  // TECHUMBRES
  {
    id: "techumbre_zinc",
    category: "Techumbres",
    name: "Techumbre Zinc / PV4 sobre Costaneras",
    subType: "Estructura Metálica",
    baseUnit: "m2",
    materialIds: ["pv4", "cost_c_80", "torn_techo"],
    laborRate: 14500,
    performance: 15,
    squad: "1 Maestro + 2 Ayudantes",
    tags: ["techo", "cubierta", "zinc", "techumbre", "pv4"]
  },
  // ALBAÑILERÍA
  {
    id: "albañileria_ladrillo",
    category: "Albañilería",
    name: "Cierre de Albañilería Princesa",
    subType: "Manual Reforzada",
    baseUnit: "m2",
    materialIds: ["lad_princesa", "cem_esp", "arena_mezcla", "fierro_8"],
    laborRate: 18500,
    performance: 8,
    squad: "1 Maestro + 1 Ayudante",
    tags: ["albañilería", "ladrillo", "muro", "perimetral", "princesa"]
  }
];
