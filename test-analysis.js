import jwt from 'jsonwebtoken';
// import fetch from 'node-fetch'; // No longer needed in Node 18+
import fs from 'fs';
import FormData from 'form-data';

const JWT_SECRET = 'obra-super-secret-key';
const MOCK_USER = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'michael.seura.delgado@gmail.com',
  role: 'admin',
  status: 'approved'
};

const token = jwt.sign(MOCK_USER, JWT_SECRET, { expiresIn: '1h' });
const API_URL = 'http://localhost:4000/api/analyze';

async function testAnalysis() {
  console.log("🚀 Iniciando prueba de diagnóstico /api/analyze...");
  
  // Create a dummy image file
  const dummyFilePath = './test_dummy.jpg';
  fs.writeFileSync(dummyFilePath, 'fake-image-data-for-testing');
  
  const form = new FormData();
  form.append('image', fs.createReadStream(dummyFilePath));

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...form.getHeaders()
      },
      body: form
    });

    const data = await response.json();
    console.log("📊 RESPUESTA RECIBIDA:", JSON.stringify(data, null, 2));
    
    if (data.success && data.data && data.data.partida === "Radier Hormigón") {
      console.log("✅ DIAGNÓSTICO EXITOSO: El backend devolvió el Mock AI correctamente.");
    } else {
      console.error("❌ ERROR EN DIAGNÓSTICO: La respuesta no coincide con el formato esperado.");
    }
  } catch (error) {
    console.error("❌ ERROR DE CONEXIÓN:", error.message);
  } finally {
    if (fs.existsSync(dummyFilePath)) fs.unlinkSync(dummyFilePath);
  }
}

testAnalysis();
