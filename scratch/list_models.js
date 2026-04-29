import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function listModels() {
  try {
    const models = await genAI.listModels();
    console.log("Modelos disponibles:");
    console.log(JSON.stringify(models, null, 2));
  } catch (error) {
    console.error("Error listando modelos:", error);
  }
}

listModels();
