import jwt from 'jsonwebtoken';
import fs from 'fs';

const JWT_SECRET = 'obra-super-secret-key';
const MOCK_USER = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'michael.seura.delgado@gmail.com',
  role: 'admin',
  status: 'approved'
};

const token = jwt.sign(MOCK_USER, JWT_SECRET, { expiresIn: '1h' });
const API_URL = 'http://localhost:8080/api/projects';

async function testPersistence() {
  console.log("🚀 Iniciando prueba de persistencia /api/projects...");
  
  const projectData = {
    workProjectId: 'default',
    elemento: 'Radier Audit',
    sistema: 'Radier H20',
    dimensiones: { largo: 10, ancho: 5, espesor: 0.1, alto: 0 },
    materiales: [],
    totalCost: { total: 1000000 },
    image: '/uploads/test.jpg'
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ projectData: JSON.stringify(projectData) })
    });

    const data = await response.json();
    console.log("📊 RESPUESTA RECIBIDA:", JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log("✅ PERSISTENCIA EXITOSA: El proyecto fue guardado en el archivo local.");
    } else {
      console.error("❌ ERROR EN PERSISTENCIA:", data.error);
    }
  } catch (error) {
    console.error("❌ ERROR DE CONEXIÓN:", error.message);
  }
}

testPersistence();
