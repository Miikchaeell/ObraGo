import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function testModel() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Dime hola");
    const response = await result.response;
    console.log("Respuesta:", response.text());
  } catch (error) {
    console.error("Error en el test:", error);
  }
}

testModel();
