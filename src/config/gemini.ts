import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY!;
if (!apiKey) {
  throw new Error('Missing Gemini API key');
}

export const genAI = new GoogleGenerativeAI(apiKey);

// Modelo para texto
export const textModel = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.9,
    topP: 0.95,
    maxOutputTokens: 8192,
  }
});

// Modelo para vision (si necesitas analizar imágenes)
export const visionModel = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash'
});
