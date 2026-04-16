export type Material = {
  id: string;
  name: string;
  category: "Planchas" | "Perfiles" | "Fijaciones" | "Hormigones" | "Aislación" | "Maderas" | "Revestimientos" | "Otros";
  unit: "un" | "cajas" | "m2" | "m3" | "mt" | "sacos" | "kg" | "Global" | "L";
  coverage: number; // Por m2 o m3
  refPrice: number; // Precio base CLP
  tags: string[];
};

export const MATERIALS_CATALOG: Material[] = [
  // PLANCHAS Y VOLCANITAS
  { id: "v_st_10", name: "Volcanita ST 10mm (1.2x2.4)", category: "Planchas", unit: "un", coverage: 0.35, refPrice: 7800, tags: ["tabique", "cielo"] },
  { id: "v_rh_12", name: "Volcanita RH 12.5mm (1.2x2.4)", category: "Planchas", unit: "un", coverage: 0.35, refPrice: 12500, tags: ["tabique", "baño", "cocina"] },
  { id: "fibro_6", name: "Fibrocemento 6mm (1.2x2.4)", category: "Planchas", unit: "un", coverage: 0.35, refPrice: 14500, tags: ["exterior", "muro"] },
  { id: "osb_9", name: "Placa OSB 9mm (1.22x2.44)", category: "Planchas", unit: "un", coverage: 0.34, refPrice: 11500, tags: ["cierre", "perimetral", "provissorio"] },
  { id: "sip_75", name: "Panel SIP 75mm (1.22x2.44)", category: "Planchas", unit: "un", coverage: 0.34, refPrice: 45000, tags: ["estructura", "sip", "aislacion"] },

  // TECHUMBRES
  { id: "zinc_ond", name: "Zinc Ondulado 0.35mm 3.6mt", category: "Planchas", unit: "un", coverage: 0.30, refPrice: 9500, tags: ["cierre", "techo", "provisorio"] },
  { id: "pv4", name: "Panel PV4 Prepintado 0.4mm", category: "Planchas", unit: "m2", coverage: 1.05, refPrice: 8500, tags: ["techo", "cubierta", "techumbre"] },
  { id: "teja_asf", name: "Teja Asfáltica (Paquete 3m2)", category: "Planchas", unit: "m2", coverage: 1.10, refPrice: 12500, tags: ["techumbre", "teja"] },
  { id: "poly_8", name: "Policarbonato Alveolar 8mm", category: "Planchas", unit: "m2", coverage: 1.05, refPrice: 9800, tags: ["techo", "terraza", "transparente"] },

  // PERFILES Y MADERAS
  { id: "mont_60", name: "Montante Metalcon 60x38x0.5mm 3mt", category: "Perfiles", unit: "mt", coverage: 0.85, refPrice: 3200, tags: ["tabique", "metalcon"] },
  { id: "canal_60", name: "Canal Metalcon 60x38x0.5mm 3mt", category: "Perfiles", unit: "mt", coverage: 0.45, refPrice: 2800, tags: ["tabique", "metalcon"] },
  { id: "pino_2x3", name: "Pino Dimensionado 2x3\" 3.2mt", category: "Maderas", unit: "mt", coverage: 0.65, refPrice: 2200, tags: ["cierre", "estructura", "provisorio"] },
  { id: "pino_2x4", name: "Pino Dimensionado 2x4\" 3.2mt", category: "Maderas", unit: "mt", coverage: 0.55, refPrice: 3500, tags: ["estructura", "vivienda"] },
  { id: "cercha_mad", name: "Cercha Madera (Fabricación)", category: "Maderas", unit: "un", coverage: 0.15, refPrice: 25000, tags: ["techumbre", "estructura"] },

  // HORMIGONES Y ALBAÑILERÍA (Norma NCh 170)
  { id: "horm_g17", name: "Hormigón Grado G17", category: "Hormigones", unit: "m3", coverage: 1.0, refPrice: 118000, tags: ["radier", "plantilla"] },
  { id: "horm_g20", name: "Hormigón Grado G20", category: "Hormigones", unit: "m3", coverage: 1.0, refPrice: 125000, tags: ["radier", "fundacion"] },
  { id: "horm_g25", name: "Hormigón Grado G25", category: "Hormigones", unit: "m3", coverage: 1.05, refPrice: 138000, tags: ["losa", "viga", "pilar"] },
  { id: "horm_g30", name: "Hormigón Grado G30", category: "Hormigones", unit: "m3", coverage: 1.0, refPrice: 152000, tags: ["estructura", "vivienda"] },
  { id: "horm_g35", name: "Hormigón Grado G35", category: "Hormigones", unit: "m3", coverage: 1.0, refPrice: 168000, tags: ["estructura", "industrial"] },
  { id: "horm_g40", name: "Hormigón Grado G40", category: "Hormigones", unit: "m3", coverage: 1.0, refPrice: 185000, tags: ["ingeniería", "alta resistencia"] },
  { id: "adit_plast", name: "Aditivo Plastificante (Bombeo)", category: "Otros", unit: "L", coverage: 2.5, refPrice: 5200, tags: ["aditivo", "bombeo"] },
  { id: "lad_fiscal", name: "Ladrillo Fiscal 29x14x7cm", category: "Hormigones", unit: "un", coverage: 38, refPrice: 480, tags: ["albañilería", "muro"] },
  { id: "lad_princesa", name: "Ladrillo Princesa (Gran Formato)", category: "Hormigones", unit: "un", coverage: 42, refPrice: 650, tags: ["albañilería", "revestimiento"] },
  { id: "bloque_horm", name: "Bloque de Hormigón 19x19x39cm", category: "Hormigones", unit: "un", coverage: 12.5, refPrice: 1200, tags: ["muro", "perimetral"] },
  { id: "fierro_8", name: "Fierro Estriado 8mm (Tira 6mt)", category: "Perfiles", unit: "un", coverage: 0.55, refPrice: 6200, tags: ["estructura", "muro"] },
  { id: "fierro_10", name: "Fierro Estriado 10mm (Tira 6mt)", category: "Perfiles", unit: "un", coverage: 0.50, refPrice: 8500, tags: ["estructura", "columna"] },
  { id: "fierro_12", name: "Fierro Estriado 12mm (Tira 6mt)", category: "Perfiles", unit: "un", coverage: 0.45, refPrice: 11200, tags: ["estructura", "cimiento"] },
  { id: "pandereta", name: "Placa Pandereta 2.0x0.5m", category: "Hormigones", unit: "un", coverage: 1.0, refPrice: 15000, tags: ["cierre", "pandereta"] },

  // TERMINACIONES
  { id: "ceramica_piso", name: "Cerámica Piso 33x33 (Caja)", category: "Revestimientos", unit: "m2", coverage: 1.05, refPrice: 8900, tags: ["piso", "terminacion"] },
  { id: "piso_flot", name: "Piso Flotante 8mm (Caja)", category: "Revestimientos", unit: "m2", coverage: 1.05, refPrice: 12000, tags: ["piso", "terminacion"] },
  { id: "pintura_lat", name: "Pintura Látex (Galón)", category: "Revestimientos", unit: "L", coverage: 0.1, refPrice: 18500, tags: ["muro", "color"] },
  { id: "siding_pvc", name: "Siding PVC Blanco (Tira 3.8m)", category: "Revestimientos", unit: "m2", coverage: 1.05, refPrice: 7500, tags: ["revestimiento", "exterior"] },

  // TERRENO Y OTROS
  { id: "retiro_esc", name: "Retiro de Escombros (Tolva)", category: "Otros", unit: "m3", coverage: 1.0, refPrice: 15000, tags: ["limpieza", "terreno"] },
  { id: "mov_tierra", name: "Movimiento de Tierra (Excavación)", category: "Otros", unit: "m3", coverage: 1.0, refPrice: 18500, tags: ["terreno", "excavacion"] },
  { id: "cem_saco", name: "Cemento Especial (Saco 42.5kg)", category: "Hormigones", unit: "sacos", coverage: 0.15, refPrice: 9200, tags: ["insumo", "mezcla"] },
  { id: "malla_acma_c92", name: "Malla ACMA C-92 (2.6x5m)", category: "Hormigones", unit: "un", coverage: 0.08, refPrice: 38500, tags: ["radier", "pavimento"] },
  { id: "malla_acma_c139", name: "Malla ACMA C-139 (2.6x5m)", category: "Hormigones", unit: "un", coverage: 0.08, refPrice: 52000, tags: ["radier", "losa"] },
  { id: "malla_acma_c188", name: "Malla ACMA C-188 (2.6x5m)", category: "Hormigones", unit: "un", coverage: 0.08, refPrice: 68500, tags: ["radier", "comercial"] },
  
  // RAW MATERIALS (MEZCLA EN OBRA)
  { id: "arena_m3", name: "Arena Gruesa", category: "Hormigones", unit: "m3", coverage: 0.55, refPrice: 22000, tags: ["arido", "mezcla"] },
  { id: "gravilla_m3", name: "Gravilla 3/4\"", category: "Hormigones", unit: "m3", coverage: 0.85, refPrice: 24500, tags: ["arido", "mezcla"] },

  // ADITIVOS
  { id: "adit_imper", name: "Aditivo Impermeabilizante", category: "Otros", unit: "L", coverage: 2.0, refPrice: 4500, tags: ["aditivo"] },
  { id: "adit_fibra", name: "Fibras de Polipropileno", category: "Otros", unit: "kg", coverage: 0.6, refPrice: 8900, tags: ["aditivo"] },
  { id: "adit_retar", name: "Aditivo Retardante", category: "Otros", unit: "L", coverage: 1.5, refPrice: 3800, tags: ["aditivo"] },

  // SERVICIOS Y ACABADOS
  { id: "serv_bomba", name: "Servicio Bomba + Operador", category: "Otros", unit: "m3", coverage: 1.0, refPrice: 15500, tags: ["servicio", "bombeo"] },
  { id: "acab_heli", name: "Acabado Helicóptero Industrial", category: "Otros", unit: "m2", coverage: 1.0, refPrice: 4200, tags: ["terminacion"] },
  { id: "acab_escob", name: "Acabado Escobillado", category: "Otros", unit: "m2", coverage: 1.0, refPrice: 1800, tags: ["terminacion"] },
];

export const SYSTEMS_CATALOG: ConstructionSystem[] = [
  // OBRA GRUESA
  {
    id: "radier_estandar",
    category: "Obra Gruesa",
    name: "Radier de Hormigón H20 (e=10cm)",
    subType: "Hormigón + Malla ACMA",
    baseUnit: "m2",
    materialIds: ["horm_h20", "malla_acma_c92", "cem_saco"],
    laborRate: 14500,
    performance: 12,
    squad: "1 Maestro + 2 Ayudantes",
    tags: ["radier", "pavimento", "obra gruesa"]
  },
  {
    id: "muro_ladrillo_prin",
    category: "Obra Gruesa",
    name: "Muro de Ladrillo Princesa",
    subType: "Albañilería Reforzada",
    baseUnit: "m2",
    materialIds: ["lad_princesa", "cem_saco", "fierro_10"],
    laborRate: 18500,
    performance: 8,
    squad: "1 Maestro + 1 Ayudante",
    tags: ["muro", "ladrillo", "albañileria"]
  },
  {
    id: "pilar_viga_horm",
    category: "Obra Gruesa",
    name: "Pilares y Vigas de Hormigón",
    subType: "Hormigón H25",
    baseUnit: "m3",
    materialIds: ["horm_h25", "fierro_10"],
    laborRate: 45000,
    performance: 2,
    squad: "1 Maestro + 2 Ayudantes",
    tags: ["estructura", "hormigon", "viga", "pilar"]
  },

  // ESTRUCTURAS / TABIQUERÍA
  {
    id: "tabique_metalcon",
    category: "Estructuras",
    name: "Tabique Metalcon + Volcanita",
    subType: "Perfil 60mm",
    baseUnit: "m2",
    materialIds: ["mont_60", "canal_60", "v_st_10"],
    laborRate: 12500,
    performance: 15,
    squad: "1 Maestro + 1 Ayudante",
    tags: ["tabique", "metalcon", "volcanita"]
  },
  {
    id: "estructura_sip",
    category: "Estructuras",
    name: "Muro de Paneles SIP 75mm",
    subType: "SIP Estructural",
    baseUnit: "m2",
    materialIds: ["sip_75"],
    laborRate: 11000,
    performance: 20,
    squad: "1 Maestro + 1 Ayudante",
    tags: ["sip", "panel", "rapido"]
  },

  // TECHUMBRES
  {
    id: "techumbre_zinc",
    category: "Techumbres",
    name: "Techumbre Zinc Acanalado",
    subType: "Sobre Cerchas Madera",
    baseUnit: "m2",
    materialIds: ["zinc_ond", "cercha_mad"],
    laborRate: 14500,
    performance: 18,
    squad: "1 Maestro + 2 Ayudantes",
    tags: ["techo", "zinc", "cubierta"]
  },
  {
    id: "teja_asfaltica",
    category: "Techumbres",
    name: "Cubierta Teja Asfáltica",
    subType: "Teja sobre OSB",
    baseUnit: "m2",
    materialIds: ["teja_asf", "osb_9"],
    laborRate: 16500,
    performance: 15,
    squad: "1 Maestro + 1 Ayudante",
    tags: ["techo", "teja", "vivienda"]
  },

  // TERMINACIONES
  {
    id: "piso_piso_flot",
    category: "Terminaciones",
    name: "Piso Flotante 8mm",
    subType: "Instalación sobre Radier",
    baseUnit: "m2",
    materialIds: ["piso_flot"],
    laborRate: 7500,
    performance: 25,
    squad: "1 Maestro",
    tags: ["piso", "flotante", "terminacion"]
  },
  {
    id: "pintura_muros",
    category: "Terminaciones",
    name: "Pintura Látex Muros",
    subType: "2 Manos + Empaste",
    baseUnit: "m2",
    materialIds: ["pintura_lat"],
    laborRate: 4500,
    performance: 40,
    squad: "1 Pintor",
    tags: ["pintura", "muro", "terminacion"]
  },

  // TERRENO
  {
    id: "retiro_escombros",
    category: "Terreno",
    name: "Retiro de Escombros",
    subType: "Carga + Transporte",
    baseUnit: "m3",
    materialIds: ["retiro_esc"],
    laborRate: 12000,
    performance: 10,
    squad: "2 Jornales",
    tags: ["terreno", "limpieza"]
  },
  {
    id: "cierro_pandereta",
    category: "Terreno",
    name: "Cierro Pandereta Hormigón",
    subType: "Placa Lizada",
    baseUnit: "mt",
    materialIds: ["pandereta"],
    laborRate: 25000,
    performance: 15,
    squad: "1 Maestro + 2 Ayudantes",
    tags: ["cierro", "pandereta", "seguridad"]
  }
];

export type ConstructionSystem = {
  id: string;
  category: "Obra Gruesa" | "Estructuras" | "Techumbres" | "Terminaciones" | "Terreno" | string;
  name: string;
  subType?: string;
  baseUnit: "m" | "m2" | "m3" | "mt";
  materialIds: string[];
  laborRate: number; // CLP por unidad
  performance: number; // Unidades por día
  squad: string;
  tags: string[];
};
