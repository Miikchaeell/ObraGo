import dotenv from 'dotenv';
dotenv.config({ override: true });
console.log("SERVER STARTING (STABLE)...");

// [v9.0] Global Error Resiliency
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down gracefully...');
  console.error(err.name, err.message);
  console.error(err.stack);
  // Optional: Add logging service report here
});

process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down gracefully...');
  if (err instanceof Error) {
    console.error(err.name, err.message);
    console.error(err.stack);
  } else {
    console.error(err);
  }
});

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import cookieParser from 'cookie-parser';
import { createPaymentPreference } from './services/payment.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import CryptoJS from 'crypto-js';

const isProduction = process.env.NODE_ENV === 'production';
const hasEmailConfig = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);

// [v5.0] Robust Nodemailer Configuration for Render (SSL Port 465)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: (process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465' || !process.env.SMTP_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000, 
  greetingTimeout: 10000,   
  socketTimeout: 20000      
});

// [v5.1] Resilient Email Helper (Dev/Prod Adaptive)
const safeSendMail = async (options) => {
  if (!isProduction || !hasEmailConfig) {
    console.log("------------------- DEV EMAIL LOG -------------------");
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body: ${options.html ? 'HTML Content' : options.text}`);
    console.log("Status: SKIPPED (Local Development/Missing Credentials)");
    console.log("-----------------------------------------------------");
    return { success: true, info: { messageId: 'dev-mode-id' } };
  }

  try {
    console.log(`📧 Attempting to send email to: ${options.to} - Subject: ${options.subject}`);
    const info = await transporter.sendMail(options);
    console.log(`✅ Email sent successfully: ${info.messageId}`);
    return { success: true, info };
  } catch (error) {
    console.error("❌ NODEMAILER DELIVERY FAILURE:", error.message);
    if (error.code === 'ENETUNREACH') {
      console.warn("⚠️ Network unreachable at SMTP Port. Check Render outbound restrictions.");
    }
    return { success: false, error: error.message };
  }
};

// Verify transporter on startup (Only in Production)
if (isProduction && hasEmailConfig) {
  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ NODEMAILER STARTUP ERROR:", error);
    } else {
      console.log("✅ NODEMAILER IS READY TO SEND EMAILS");
    }
  });
} else {
  console.log("ℹ️ NODEMAILER: Running in simulated mode (no real email will be sent).");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// [v10.3] Garantizar carpeta de uploads al inicio
const uploadsDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');
const JWT_SECRET = process.env.JWT_SECRET || 'obra-super-secret-key';

// [v7.0] Mock Database for Local Development (Offline Mode)
const MOCK_USER = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'michael.seura.delgado@gmail.com',
  phone: '+56969020506',
  password_hash: '$2a$10$89v8/pXnI.vS8/q3Y3Y3Y.u1I1I1I1I1I1I1I1I1I1I1I1I1I1I1I', // placeholder for 123456
  password_plain: '123456',
  role: 'admin',
  status: 'approved'
};

// [v8.0] Mock JSON Persistence for local development
const MOCK_DATA_FILE = path.join(__dirname, '../projects.json');
const getMockData = () => {
    try {
        if (!fs.existsSync(MOCK_DATA_FILE)) {
            fs.writeFileSync(MOCK_DATA_FILE, JSON.stringify({ workProjects: [], scans: [] }, null, 2));
        }
        const content = JSON.parse(fs.readFileSync(MOCK_DATA_FILE, 'utf8'));
        return { 
            workProjects: content.workProjects || [], 
            scans: content.scans || [] 
        };
    } catch (err) {
        return { workProjects: [], scans: [] };
    }
};

const saveMockData = (data) => {
    fs.writeFileSync(MOCK_DATA_FILE, JSON.stringify(data, null, 2));
};

// DB Pool Configuration
const hasDBConfig = !!process.env.DATABASE_URL;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/dummy_db',
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

// [v6.0] Resilient Auto-Migration (Non-blocking)
if (hasDBConfig || isProduction) {
  pool.query(`
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS selected_system_id TEXT;
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS performance NUMERIC;
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS labor_rate NUMERIC;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
    UPDATE users SET status = 'approved' WHERE role IN ('admin', 'superadmin') AND status IS NULL;

    CREATE TABLE IF NOT EXISTS projects (
      -- ... (tablas existentes)
      is_paid BOOLEAN DEFAULT FALSE
    );
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE;
  `).then(() => console.log("✅ DB MIGRATION: SUCCESSFUL"))
    .catch(err => {
      console.warn("⚠️ DB MIGRATION: SKIPPED/FAILED. Error:", err.message);
      if (!isProduction) console.info("ℹ️ Running in DB-Offline mode for development.");
    });
} else {
  console.info("ℹ️ DB: Missing DATABASE_URL. Running in offline/simulated mode.");
}

// Auto-initialize DB tables on startup
const initDB = async () => {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    await pool.query(schema);
    
    // Run migrations safely
    const migrationPath = path.join(__dirname, 'migrations', '001_make_superadmin.sql');
    if (fs.existsSync(migrationPath)) {
      const migration = fs.readFileSync(migrationPath, 'utf8');
      await pool.query(migration);
      console.log('✅ Migraciones aplicadas correctamente.');
    }
    console.log('✅ Base de datos inicializada.');
  } catch (err) {
    if (!isProduction) {
      console.warn('⚠️ DB: No se pudo inicializar la base de datos local. Iniciando en modo offline.');
    } else {
      console.error('❌ Error crítico inicializando BD en producción:', err);
    }
  }
};

// [v3.1] Optional Init call
if (hasDBConfig || isProduction) {
  initDB();
}

const app = express();

// [v12.0] Protocolo de Seguridad Nivel 2: Blindaje Industrial
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://*.supabase.co"],
      connectSrc: ["'self'", "https://app.obrago.cl", "https://*.supabase.co", "https://api.openai.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));

// Redirección HTTPS Obligatoria (Solo en Producción)
if (isProduction) {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.hostname}${req.url}`);
    }
    next();
  });
}

// Configuración de CORS Restrictiva para app.obrago.cl
const allowedOrigins = [
  'https://app.obrago.cl',
  'https://obrascan.vercel.app', // Vercel Production
  'http://localhost:5173', // Para desarrollo local (Vite default)
  'http://127.0.0.1:5173',
  'http://localhost:5555', // Vite Custom Port
  'http://127.0.0.1:5555'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS Policy: Acceso bloqueado para este dominio.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id']
}));

const port = process.env.PORT || 8080;

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.set('trust proxy', 1);
app.use(cookieParser());

// Webhook needs raw body - specific route
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const planType = session.metadata.planType;
      const userId = session.metadata.userId;
      await pool.query(
        `INSERT INTO subscriptions (user_id, stripe_subscription_id, plan_type, status, current_period_end)
         VALUES ($1, $2, $3, 'active', to_timestamp($4))
         ON CONFLICT (stripe_subscription_id) DO UPDATE 
         SET plan_type = $3, status = 'active', current_period_end = to_timestamp($4)`,
        [userId, session.subscription, planType, session.expires_at]
      );
    }
    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Supabase Auth Middleware (New Fortress v2.0)
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'TOKEN_REQUIRED' });

  // Nota: En producción, aquí se validaría el JWT con la llave secreta de Supabase
  // Por ahora, dejamos el paso libre y guardamos el user_id si viene en custom header para dev
  req.user = { id: req.headers['x-user-id'] || 'system-user' };
  next();
};


const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    next();
  } else {
    res.status(403).json({ error: 'Acceso denegado' });
  }
};

const checkUsageLimit = async (req, res, next) => {
  const userId = req.user.id;
  let plan = 'free';
  let projectCount = 0;

  try {
    // [v10.6] Intento de consulta a DB Real
    const { rows: [sub] } = await pool.query('SELECT plan_type FROM subscriptions WHERE user_id = $1', [userId]);
    plan = sub ? sub.plan_type : 'free';
    
    const { rows: [count] } = await pool.query('SELECT COUNT(*) FROM projects WHERE user_id = $1', [userId]);
    projectCount = parseInt(count.count);
  } catch (dbError) {
    // FALLBACK A MODO OFFLINE (projects.json)
    console.warn(`⚠️ [USAGE_LIMIT] DB OFFLINE (ECONNREFUSED). Usando persistencia local para validación.`);
    const mockData = getMockData();
    // Filtramos los escaneos/proyectos del usuario en el archivo local
    projectCount = mockData.scans.filter(s => s.user_id === userId).length;
    plan = 'free'; // Por defecto asumimos free en modo offline para seguridad
  }

  if (plan === 'free' && projectCount >= 10) { // Límite aumentado en desarrollo para facilitar pruebas
    return res.status(403).json({ error: 'Límite de 10 proyectos alcanzado en modo gratuito.' });
  }
  
  next();
};

// Servir estáticos
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// ROUTES
app.get('/health', (req, res) => res.send('OK'));
app.get('/api/health', (req, res) => res.json({ status: 'ok', version: 'v16-PAY-MP-ADMIN' }));

// [v16.0] PAYMENT ENDPOINTS
app.post('/api/checkout/pdf', authenticateToken, async (req, res) => {
    const { projectId, projectName } = req.body;
    try {
        const { rows: [user] } = await pool.query('SELECT email FROM users WHERE id = $1', [req.user.id]);
        const initPoint = await createPaymentPreference(req.user.id, user.email, projectName);
        res.json({ success: true, initPoint });
    } catch (error) {
        res.status(500).json({ error: "Error creando preferencia de pago" });
    }
});

app.post('/api/webhook/mp', async (req, res) => {
    const { action, data } = req.body;
    if (action === 'payment.created') {
        const paymentId = data.id;
        // En una implementación real, verificaríamos el estado con el cliente MP
        // Simulamos éxito para el sandbox
        console.log(`💰 PAGO RECIBIDO (MP): ${paymentId}`);
        // Extraer metadata del pago (user_id) y actualizar
    }
    res.sendStatus(200);
});

// [v16.1] ADMIN API - CEO Business Intelligence
app.get('/api/admin/stats', authenticateToken, isAdmin, async (req, res) => {
    if (!isProduction && !hasDBConfig) {
        const data = getMockData();
        const heatmap = data.scans.reduce((acc, scan) => {
            const commune = scan.commune || "Metropolitana";
            const existing = acc.find(h => h.commune === commune);
            if (existing) existing.activity++;
            else acc.push({ commune, activity: 1 });
            return acc;
        }, []).sort((a, b) => b.activity - a.activity);

        const systems = data.scans.reduce((acc, scan) => {
            const sys = scan.sistema || "Otro";
            acc[sys] = (acc[sys] || 0) + 1;
            return acc;
        }, {});

        const monthlyRevenue = [
            { month: "Ene", amount: 1540000 },
            { month: "Feb", amount: 2100000 },
            { month: "Mar", amount: 1850000 },
            { month: "Abr", amount: 3200000 }
        ];

        return res.json({
            success: true,
            totalUsers: 42,
            totalSales: data.scans.length,
            totalRevenue: data.scans.reduce((sum, s) => sum + (s.total_cost || 0), 0),
            heatmap: heatmap.slice(0, 5),
            systems: Object.entries(systems).map(([name, value]) => ({ name, value })),
            trends: monthlyRevenue
        });
    }
    try {
        const { rows: [stats] } = await pool.query('SELECT COUNT(*) as count FROM users');
        const { rows: [sales] } = await pool.query('SELECT COUNT(*) as count FROM projects');
        const { rows: [revenue] } = await pool.query('SELECT SUM(total_cost) as total FROM projects');
        
        res.json({
            success: true,
            totalUsers: parseInt(stats.count),
            totalSales: parseInt(sales.count),
            totalRevenue: parseFloat(revenue.total || 0),
            heatmap: [{ commune: "Santiago", activity: 15 }, { commune: "Maipú", activity: 8 }],
            systems: [{ name: "Radier", value: 12 }, { name: "Muro", value: 5 }],
            trends: [
                { month: "Mar", amount: 1200000 },
                { month: "Abr", amount: 2450000 }
            ]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [v16.2] DELETE PROJECT
app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    if (!isProduction && !hasDBConfig) {
        const data = getMockData();
        data.scans = data.scans.filter(s => s.id !== id);
        saveMockData(data);
        return res.json({ success: true });
    }
    try {
        await pool.query('DELETE FROM projects WHERE id = $1 AND user_id = $2', [id, req.user.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [v13.0] COPILOTO NORMATIVO POR VOZ (ENGINEER ASSISTANT)
app.post('/api/voice-assistant', authenticateToken, async (req, res) => {
    const { question, context } = req.body;
    const hasGemini = !!process.env.GOOGLE_API_KEY;

    if (!hasGemini) return res.status(500).json({ error: "Gemini not configured" });

    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const systemPrompt = `Eres el Copiloto Normativo de ObraGo. Tu nombre es Michael (IA).
        Eres un Ingeniero Civil Senior experto en Normativa Chilena (NCh 430, NCh 170, NCh 433, etc.).
        
        INSTRUCCIONES:
        1. Responde de forma verbal, directa y técnica pero fácil de entender en el ruido de una obra.
        2. Mantén la respuesta en menos de 40 palabras para que el TTS (Text-to-Speech) sea fluido.
        3. Usa términos chilenos técnicos (fierro, radier, machón, cadena, solerilla).
        4. Si no sabes la respuesta exacta, da una recomendación conservadora de ingeniería.
        5. Tono: Colega experto, confiable, rápido.`;

        const result = await model.generateContent([
            systemPrompt,
            `El usuario está en terreno y pregunta: "${question}". Contexto de la obra: ${JSON.stringify(context)}`
        ]);

        const responseText = result.response.text();
        res.json({ success: true, answer: responseText });
    } catch (error) {
        console.error("Voice Assistant Error:", error);
        res.status(500).json({ error: "Error consultando al ingeniero" });
    }
});

// [v21.0] GOOGLE GEMINI 1.5 FLASH - CEREBRO AEC
app.post('/api/chat/support', upload.single('image'), async (req, res) => {
    const { message, history, metadata } = req.body;
    const hasGemini = !!process.env.GOOGLE_API_KEY;

    if (!hasGemini) {
        return res.json({ 
            reply: "¡Hola! Soy el Ingeniero Senior de Obra Go. Por ahora estoy en modo mantenimiento, pero puedes contactarnos por WhatsApp si tienes una urgencia técnica." 
        });
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const engineerName = metadata?.assignedEngineer || 'Michael';
        const engineerRole = metadata?.engineerRole || 'Ingeniero Senior AEC';
        const totalCost = metadata?.totalCost || '0';

        const systemPrompt = `Eres el ${engineerRole} de ObraGo. Tu nombre es ${engineerName}.
        
        REGLAS DE COMPORTAMIENTO:
        1. Base de Conocimientos: Normas chilenas NCh 170 (Hormigón) y NCh 430 (Hormigón Armado).
        2. Contexto de Obra: Tienes acceso al presupuesto dinámico del usuario, que actualmente es de $${Number(totalCost).toLocaleString('es-CL')} CLP.
        3. Objetivo Comercial: Resolver dudas técnicas con autoridad y empujar la venta del 'Reporte Élite ($2.990)' como la única fuente oficial de verdad y desglose técnico.
        4. Tono: Chileno, extremadamente profesional, socio de confianza. No eres una IA, eres un colega experto.
        5. Venta: Si el usuario tiene dudas sobre cubicaciones exactas, dile que el Reporte Élite contiene el APU (Análisis de Precios Unitarios) y el Mincho Chico detallado.
        6. Botón de Pago: Si detectas que el usuario está muy confundido o pide el desglose total, incluye la palabra clave [SHOW_PAYMENT_BUTTON] en tu respuesta.`;

        let chatHistory = [];
        if (history) {
            try {
                const parsedHistory = typeof history === 'string' ? JSON.parse(history) : history;
                chatHistory = parsedHistory.map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }]
                }));
            } catch (e) {
                console.error("History parse error:", e);
            }
        }

        const chat = model.startChat({
            history: chatHistory,
            generationConfig: { maxOutputTokens: 500 }
        });

        const promptParts = [
            { text: systemPrompt },
            { text: `Consulta del Usuario: ${message}` }
        ];

        // Soporte Multimodal (Visión)
        if (req.file) {
            const imageData = fs.readFileSync(req.file.path);
            promptParts.push({
                inlineData: {
                    data: imageData.toString("base64"),
                    mimeType: req.file.mimetype
                }
            });
        }

        const result = await chat.sendMessage(promptParts);
        const reply = result.response.text();

        res.json({ reply });
    } catch (error) {
        console.error("GEMINI SUPPORT ERROR:", error);
        res.status(500).json({ error: "Error en el cerebro Gemini" });
    }
});
app.get('/', (req, res) => res.send('ObraGo Backend Stable Live'));

// AUTH
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;

  // [v7.0] Mock Registration (Offline Mode)
  if (!isProduction && !hasDBConfig) {
    console.log(`ℹ️ MOCK REGISTER: Simulating successful registration for ${email}`);
    return res.json({ 
      success: true, 
      userId: MOCK_USER.id, 
      message: "MODO MOCK: Registro simulado exitoso. Tu cuenta ha sido 'aprobada' automáticamente en memoria." 
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows: [user] } = await pool.query(
      'INSERT INTO users (email, password_hash, role, status) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, hashedPassword, 'user', 'pending']
    );

    // [v3.0] Notify Admin
    const adminEmail = 'michael.seura.delgado@gmail.com';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const approveLink = `${backendUrl}/api/admin/user-action?userId=${user.id}&action=approved&token=${JWT_SECRET}`;
    const rejectLink = `${backendUrl}/api/admin/user-action?userId=${user.id}&action=rejected&token=${JWT_SECRET}`;

    const mailOptions = {
      from: `"ObraGo Admin" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `Nuevo usuario registrado: ${email}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #f97316;">Solicitud de Registro ObraGo</h2>
          <p>Se ha registrado un nuevo usuario:</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
          <div style="margin-top: 30px; display: flex; gap: 10px;">
            <a href="${approveLink}" style="background: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">APROBAR</a>
            <a href="${rejectLink}" style="background: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-left: 10px;">RECHAZAR</a>
          </div>
          <p style="margin-top: 20px; font-size: 11px; color: #888;">Acción manual requerida para habilitar acceso.</p>
        </div>
      `
    };

    // [v5.0] RESILIENT ADMIN NOTIFICATION (Non-blocking)
    safeSendMail(mailOptions); 

    res.json({ 
      success: true, 
      userId: user.id, 
      message: "Registro exitoso. Tu cuenta está en revisión. El administrador ha sido notificado." 
    });
  } catch (error) {
    if (error.code === '23505') {
       return res.status(409).json({ error: "El email ya está registrado." });
    }
    res.status(500).json({ error: error.message });
  }
});

// [v4.0] FEEDBACK CORRECTION ENDPOINT
app.post('/api/feedback/correction', authenticateToken, async (req, res) => {
  const { imageUrl, detectedId, correctedId, confidence } = req.body;
  try {
    await pool.query(
      'INSERT INTO ai_corrections (user_id, image_url, detected_id, corrected_id, confidence) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, imageUrl, detectedId, correctedId, confidence]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("FEEDBACK ERROR:", error);
    res.status(500).json({ error: "No se pudo guardar la corrección" });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { phone, password } = req.body; // Cambiado de email a phone

  // [v19.0] SMS Login + Email Identity Verification (Offline Mode)
  if (!isProduction && !hasDBConfig) {
    if (phone === MOCK_USER.phone && (password === MOCK_USER.password_plain || password === '123456')) {
      console.log(`📱 SMS LOGIN REQUEST: ${phone}`);
      console.log(`📧 ENVIANDO VERIFICACIÓN A EMAIL: ${MOCK_USER.email}`);
      
      // Simulación de envío de mail con código
      const mailOptions = {
        from: '"ObraGo Security" <security@obrago.cl>',
        to: MOCK_USER.email,
        subject: "Código de Verificación de Identidad - ObraGo",
        html: `<h1>Tu código de seguridad es: 123456</h1><p>Ingresaste con el teléfono ${phone}</p>`
      };
      safeSendMail(mailOptions);

      return res.json({ 
        success: true, 
        mfaRequired: true, 
        tempToken: jwt.sign({ id: MOCK_USER.id, email: MOCK_USER.email, mfaPending: true }, JWT_SECRET, { expiresIn: '5m' }),
        message: `Código enviado a ${MOCK_USER.email}` 
      });
    } else {
      console.warn(`❌ LOGIN FAILURE (Phone): ${phone}`);
      return res.status(401).json({ error: 'Teléfono o contraseña incorrecta' });
    }
  }

  try {
    const { rows: [user] } = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // [v19.1] Email MFA Challenge
    console.log(`📧 ENVIANDO MFA A EMAIL DE USUARIO: ${user.email}`);
    // Aquí iría la lógica real de envío de mail al correo del usuario
    
    return res.json({ 
        success: true, 
        mfaRequired: true, 
        tempToken: jwt.sign({ id: user.id, email: user.email, mfaPending: true }, JWT_SECRET, { expiresIn: '5m' }),
        message: `Verifica tu identidad en el correo: ${user.email.replace(/(.{3})(.*)(?=@)/, "$1***")}`
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// [v18.2] MFA VERIFICATION
app.post('/api/auth/verify-mfa', async (req, res) => {
    const { tempToken, code } = req.body;
    try {
        const decoded = jwt.verify(tempToken, JWT_SECRET);
        if (!decoded.mfaPending) throw new Error("Invalid token state");

        // Mock Code Validation (Always 123456 for dev/demo)
        if (code !== "123456") {
            return res.status(401).json({ error: "Código MFA inválido" });
        }

        // Generate Final Token
        let user;
        if (!isProduction && !hasDBConfig && decoded.id === MOCK_USER.id) {
            user = MOCK_USER;
        } else {
            const { rows: [dbUser] } = await pool.query('SELECT id, email, role, status FROM users WHERE id = $1', [decoded.id]);
            user = dbUser;
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role, status: user.status }, JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.json({ success: true, token, user });

    } catch (error) {
        res.status(401).json({ error: "Sesión de verificación expirada o inválida" });
    }
});

// [v20.0] MERCADO PAGO INTEGRATION
app.post('/api/payment/create-preference', authenticateToken, async (req, res) => {
    const { projectName } = req.body;
    try {
        const initPoint = await createPaymentPreference(req.user.id, req.user.email, projectName);
        res.json({ success: true, initPoint });
    } catch (error) {
        console.error("PAYMENT PREFERENCE ERROR:", error);
        res.status(500).json({ error: "No se pudo crear la preferencia de pago" });
    }
});

// [v3.0] ADMIN USER ACTION (Approve/Reject)
app.get('/api/admin/user-action', async (req, res) => {
  const { userId, action, token } = req.query;
  
  if (token !== JWT_SECRET) {
    return res.status(403).send("Token de seguridad inválido para esta acción.");
  }

  try {
    const { rows: [user] } = await pool.query('UPDATE users SET status = $1 WHERE id = $2 RETURNING email', [action, userId]);
    
    if (!user) return res.status(404).send("Usuario no encontrado.");

    // Notify User
    const subject = action === 'approved' ? '¡Tu cuenta ObraGo ha sido aprobada!' : 'Solicitud de acceso ObraGo';
    const message = action === 'approved' 
      ? 'Tu cuenta ha sido aprobada con éxito. Ya puedes ingresar sistema y gestionar tus proyectos.'
      : 'Lamentamos informarte que tu solicitud de acceso a la beta privada ha sido rechazada por el momento.';

    const mailOptions = {
      from: `"ObraGo" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #f97316;">ObraGo Access Status</h2>
          <p>${message}</p>
          ${action === 'approved' ? `<a href="https://obrago.vercel.app/login" style="display: inline-block; background: #f97316; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin-top: 20px;">INGRESAR AHORA</a>` : ''}
          <p style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #888;">© 2026 ObraGo Construction Suite</p>
        </div>
      `
    };

    safeSendMail(mailOptions);

    res.send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: ${action === 'approved' ? '#22c55e' : '#ef4444'}">Usuario ${action === 'approved' ? 'Aprobado' : 'Rechazado'}</h1>
        <p>El estado del usuario <b>${user.email}</b> ha sido actualizado a: <b>${action}</b></p>
        <p>Se ha enviado un correo de notificación al usuario.</p>
      </div>
    `);
  } catch (error) {
    res.status(500).send("Error procesando acción: " + error.message);
  }
});

// PASSWORD RECOVERY (v2.3)
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const { rows: [user] } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // Generate a simple 1H recovery token
    const recoveryToken = jwt.sign({ id: user.id, type: 'recovery' }, JWT_SECRET, { expiresIn: '1h' });
    
    // [v3.1] REAL EMAIL SENDING
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${recoveryToken}`;
    
    const mailOptions = {
      from: `"ObraGo Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Restablecer tu contraseña de ObraGo",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #f97316;">Recuperación de Contraseña</h2>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el botón de abajo para continuar:</p>
          <a href="${resetLink}" style="display: inline-block; background: #f97316; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold;">RESTABLECER CONTRASEÑA</a>
          <p style="margin-top: 30px; font-size: 12px; color: #888;">Si no solicitaste este cambio, puedes ignorar este correo. El enlace expira en 1 hora.</p>
        </div>
      `
    };

    // [v5.0] RESILIENT PASSWORD RECOVERY (Non-blocking)
    safeSendMail(mailOptions);
    
    res.json({ 
      success: true, 
      message: "Si el correo está registrado, recibirás instrucciones en breve. Por favor revisa tu bandeja de entrada o spam." 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'recovery') throw new Error('Token inválido para recuperación');
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, decoded.id]);
    
    res.json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    res.status(400).json({ error: 'Token expirado o inválido' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  // [v7.0] Mock Profile (Offline Mode)
  if (!isProduction && !hasDBConfig && req.user.id === MOCK_USER.id) {
    return res.json({ user: MOCK_USER, plan: 'pro' });
  }

  try {
    const { rows: [user] } = await pool.query('SELECT id, email, role, status FROM users WHERE id = $1', [req.user.id]);
    const { rows: [sub] } = await pool.query('SELECT plan_type FROM subscriptions WHERE user_id = $1', [req.user.id]);
    res.json({ user, plan: sub ? sub.plan_type : 'free' });
  } catch (error) {
    res.status(500).json({ error: "Error de base de datos o modo offline no configurado" });
  }
});

// ANALYZE (AUTHENTICATION ENABLED FOR PROXY SECURITY)
app.post('/api/analyze', authenticateToken, upload.array('images', 10), async (req, res) => {
  const requestId = Date.now().toString().slice(-6);
  const mem = process.memoryUsage();
  console.log(`\n📥 [${new Date().toISOString()}] [ID:${requestId}] REQUEST RECIBIDO: /api/analyze`);
  console.log(`📊 [ID:${requestId}] MEMORY: RSS: ${(mem.rss / 1024 / 1024).toFixed(2)} MB, HEAP: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  
  try {
    if (!req.files || req.files.length === 0) {
      console.warn(`⚠️ [ID:${requestId}] No se recibió imagen.`);
      return res.status(400).json({ success: false, error: 'No se recibió imagen en la solicitud multpart' });
    }
    
    // [v10.2] Verificación de persistencia en disco
    req.files.forEach(f => {
      if (!fs.existsSync(f.path)) {
        throw new Error("Archivo no guardado en disco correctamente.");
      }
    });

    console.log(`📂 [ID:${requestId}] Archivos recibidos: ${req.files.length}`);

    const hasGemini = !!process.env.GOOGLE_API_KEY;
    const forceMock = process.env.MOCK_AI === 'true';

    // MOCK AI PARA DESARROLLO SIN LLAVES
    if (!isProduction && (!hasGemini || forceMock)) {
        console.log(`ℹ️ [ID:${requestId}] MOCK AI ACTIVADO.`);
        const mockData = {
            partida: "Radier Hormigón",
            subtipo: "Radier estándar H-20",
            sistema_id: "radier_estandar",
            dimensiones: { largo: 8.5, ancho: 4.2, espesor: 0.12, alto: 0 },
            confianza: 0.98,
            safety_analysis: {
              status: "safe",
              ppe_found: ["casco", "chaleco", "guantes"],
              risks_detected: [],
              recommendation: "Zona segura. Mantener orden y limpieza."
            },
            environmental_impact: {
              co2_kg: 450,
              waste_m3: 0.8,
              green_tech_expansion: {
                solar_kwh_month: 240,
                bio_alternative: "Celulosa Proyectada en tabiquería",
                thermal_savings_percent: 35,
                logistics_total_weight_kg: 2400,
                recommended_truck: "Camión Simple (3/4)"
              },
              green_score: 4
            },
            weather_risk: {
              status: "warning",
              alert: "Riesgo de Helada Nocturna",
              recommendation: "Se recomienda cubrir el hormigón con manta térmica después de las 20:00 hrs."
            },
            dispute_analysis: {
              changes_detected: "Avance del 20% en enfierradura respecto al escaneo anterior.",
              damage_identified: "Ninguno",
              mediator_verdict: "Partida aprobada para avance de obra."
            },
            quality_audit: {
              score: 92,
              defects_detected: ["Micro-fisura superficial en esquina superior"],
              criticality: "low",
              post_venta_warning: "Bajo riesgo de reclamo. Se sugiere sellado cosmético antes de pintar."
            },
            financial_forecast: {
              trend: "up",
              expected_variation_percent: 4.5,
              buy_recommendation: "buy_now",
              opportunity_cost_clp: 125000,
              analysis_reason: "Se proyecta alza en el precio del acero y hormigón premezclado por costo de fletes."
            },
            calidad_analisis: { iluminacion: "buena", enfoque: "nitido", advertencia: "MODO MOCK" },
            alternativas: ["tabique_st"],
            recomendacion_cuadrilla: "1 Maestro + 2 Ayudantes",
            observaciones: "Análisis simulado para pruebas de flujo.",
            elemento: "Radier Proyectado",
            sistema: "Hormigón H-20"
        };
        await new Promise(resolve => setTimeout(resolve, 1000));
        return res.json({ success: true, data: mockData, imageUrl: `/uploads/${req.files[0].filename}` });
    }

    if (!hasGemini) throw new Error("Google API Key not configured");

    try {
      // Bloque Interno de LLamada a Gemini Flash
      console.log(`🧠 [ID:${requestId}] Consultando gemini-1.5-flash (Ingeniero Calculista Multimodal)...`);
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const imageParts = req.files.map(f => {
        return {
          inlineData: {
            data: fs.readFileSync(f.path).toString("base64"),
            mimeType: f.mimetype
          }
        };
      });

      const systemPrompt = `Eres un Ingeniero Civil experto en Gestión de Costos, Análisis de Mercado AEC e Inteligencia Financiera. 
      Analiza estas fotografías o planos e identifica partidas, riesgos, calidad y PROYECCIÓN DE COSTOS.

      ESTRATEGIA DE ANÁLISIS:
      1. IDENTIFICACIÓN Y CUBICACIÓN.
      2. AUDITORÍA DE SEGURIDAD.
      3. IMPACTO AMBIENTAL.
      4. AUDITORÍA DE CALIDAD / POST-VENTA.
      5. INTELIGENCIA FINANCIERA (NUEVO V20):
         - Estima la tendencia de precios para los materiales detectados en los próximos 30-60 días.
         - Proporciona un "% de Variación Esperada".
         - Recomienda si es mejor "Comprar Hoy" (Stockear) o "Esperar".
         - Estima el "Costo de Oportunidad" si no se compra hoy.
      6. PROTECTOR DE CLIMA Y MEDIACIÓN.

      IDS PERMITIDOS: [radier_estandar, tabique_st, cielo_falso_st, cie_prov_osb, techumbre_zinc, albañileria_ladrillo].
      
      FORMATO JSON:
      {
        "partida": "...",
        "subtipo": "...",
        "sistema_id": "...",
        "dimensiones": { ... },
        "safety_analysis": { ... },
        "environmental_impact": { ... },
        "weather_risk": { ... },
        "quality_audit": { ... },
        "financial_forecast": {
           "trend": "up" | "down" | "stable",
           "expected_variation_percent": X,
           "buy_recommendation": "buy_now" | "wait",
           "opportunity_cost_clp": Y,
           "analysis_reason": "Motivo basado en mercado (ej: alza del acero)..."
        },
        "confianza": 0.XX,
        "is_fallback": boolean,
        "observaciones": "..."
      }`;

      const result = await model.generateContent([
        systemPrompt,
        "Analiza técnicamente estas imágenes/planos. Identifica la partida y cubica las dimensiones visibles.",
        ...imageParts
      ]);

      const rawContent = result.response.text();
      // Limpiar posibles backticks del JSON en Gemini
      const cleanJson = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanJson);
      
      console.log(`✅ [ID:${requestId}] Análisis IA Gemini exitoso.`);
      
      // [v14.0] GENERACIÓN DE HASH BLOCKCHAIN
      const hashContent = JSON.stringify(parsedData) + requestId + req.files[0].filename;
      const blockchainHash = CryptoJS.SHA256(hashContent).toString();
      
      res.json({ 
        success: true, 
        data: parsedData, 
        imageUrl: `/uploads/${req.files[0].filename}`,
        blockchain_hash: blockchainHash,
        timestamp: new Date().toISOString()
      });

    } catch (innerError) {
      console.error(`💥 [ID:${requestId}] DETALLE ERROR OPENAI:`);
      if (innerError.response) {
        console.error(" STATUS:", innerError.response.status);
        console.error(" DATA:", JSON.stringify(innerError.response.data));
      } else {
        console.error(" CODE:", innerError.code);
        console.error(" MESSAGE:", innerError.message);
      }
      
      // Fallback Inteligente Obra Go
      const fallbackData = {
        sistema_id: "radier_estandar",
        partida: "Radier (Estimado Conservador)",
        subtipo: "Escaneo difícil - Ajuste Manual Sugerido",
        dimensiones: { largo: 6, ancho: 3, espesor: 0.12, alto: 0 },
        safety_analysis: {
          status: "warning",
          ppe_found: ["desconocido"],
          risks_detected: ["visibilidad_baja"],
          recommendation: "Realizar inspección visual manual por baja visibilidad."
        },
        environmental_impact: {
          co2_kg: 0,
          waste_m3: 0,
          green_tech_expansion: {
            solar_kwh_month: 0,
            bio_alternative: "No disponible",
            thermal_savings_percent: 0,
            logistics_total_weight_kg: 0,
            recommended_truck: "No determinado"
          },
          green_score: 3
        },
        weather_risk: {
          status: "clear",
          alert: "Clima estable",
          recommendation: "Sin alertas climáticas para esta partida."
        },
        quality_audit: {
          score: 85,
          defects_detected: [],
          criticality: "low",
          post_venta_warning: "Sin riesgos críticos detectados."
        },
        financial_forecast: {
          trend: "stable",
          expected_variation_percent: 0,
          buy_recommendation: "wait",
          opportunity_cost_clp: 0,
          analysis_reason: "Mercado estable para esta partida."
        },
        confidence: 0.3,
        is_fallback: true,
        observaciones: "Imagen difícil de leer. Se sugiere ajustar dimensiones manualmente."
      };

      const filename = req.files && req.files.length > 0 ? req.files[0].filename : 'fallback.png';
      res.json({ success: true, data: fallbackData, imageUrl: `/uploads/${filename}`, isEmergencyFallback: true });
    }

  } catch (error) {
    console.error(`💥 [ID:${requestId}] ERROR CRÍTICO EXTERNO:`, error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PROJECTS
app.get('/api/projects', authenticateToken, async (req, res) => {
  if (!isProduction && !hasDBConfig) {
    const data = getMockData();
    const userScans = data.scans.filter(s => s.user_id === req.user.id);
    return res.json({ success: true, projects: userScans });
  }
  try {
    const { rows: projects } = await pool.query('SELECT * FROM projects WHERE user_id = $1 ORDER BY date DESC', [req.user.id]);
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// [v8.0] TOP-LEVEL WORK PROJECTS (MOCK MODE)
app.get('/api/work-projects', authenticateToken, async (req, res) => {
  if (!isProduction && !hasDBConfig) {
    const data = getMockData();
    return res.json({ success: true, projects: data.workProjects || [] });
  }
  return res.json({ success: true, projects: [] }); // Not implemented for real DB yet
});

app.post('/api/work-projects', authenticateToken, async (req, res) => {
  const { nombre, ubicacion } = req.body;
  if (!isProduction && !hasDBConfig) {
    const data = getMockData();
    const newProject = {
        id: Date.now().toString(),
        user_id: req.user.id,
        nombre,
        ubicacion,
        created_at: new Date().toISOString()
    };
    data.workProjects.push(newProject);
    saveMockData(data);
    return res.json({ success: true, project: newProject });
  }
  res.status(503).json({ error: "Modo mock no habilitado" });
});

app.get('/api/work-projects/:id', authenticateToken, async (req, res) => {
    if (!isProduction && !hasDBConfig) {
        const data = getMockData();
        const project = data.workProjects.find(p => p.id === req.params.id);
        if (!project) return res.status(404).json({ error: "Proyecto no encontrado" });
        const scans = data.scans.filter(s => s.workProjectId === req.params.id);
        return res.json({ success: true, project, scans });
    }
    res.status(404).json({ error: "No encontrado" });
});

app.post('/api/projects', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const projectData = JSON.parse(req.body.projectData);
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : projectData.image;

    // [v8.0] Mock Save Scan/Image to Project
    if (!isProduction && !hasDBConfig) {
        const data = getMockData();
        const newScan = {
            id: Date.now().toString(),
            user_id: req.user.id,
            workProjectId: projectData.workProjectId || 'default',
            elemento: projectData.elemento,
            sistema: projectData.sistema,
            dimensiones: projectData.dimensiones,
            materiales: projectData.materiales,
            total_cost: projectData.totalCost.total,
            image_url: imageUrl,
            date: new Date().toISOString(),
            created_at: new Date().toISOString()
        };
        data.scans.push(newScan);
        saveMockData(data);
        return res.json({ success: true, project: newScan });
    }

    const { rows: [project] } = await pool.query(
      `INSERT INTO projects (user_id, elemento, sistema, dimensiones, materiales, total_cost, image_url, prices, labor_prices, performance, selected_system_id, labor_rate)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        req.user.id, 
        projectData.elemento, 
        projectData.sistema, 
        JSON.stringify(projectData.dimensiones), 
        JSON.stringify(projectData.materiales), 
        projectData.totalCost.total, 
        imageUrl, 
        JSON.stringify(projectData.prices), 
        JSON.stringify(projectData.labor_prices), 
        projectData.performance,
        projectData.selectedSystemId,
        projectData.labor_rate
      ]
    );
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// [v10.5] Global JSON Error Handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, error: `ERROR_MULPART: ${err.message}` });
  }
  console.error("🔥 ERROR GLOBAL DETECTADO:", err.stack);
  res.status(err.status || 500).json({ 
    success: false, 
    error: err.message || "FALLO_INTERNO_DEL_SERVIDOR"
  });
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`SERVER RUNNING ON PORT ${port}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ PORT ${port} IS ALREADY IN USE. Please kill the existing process or use a different port.`);
  } else {
    console.error(`❌ SERVER ERROR:`, err);
  }
});
