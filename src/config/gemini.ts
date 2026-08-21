import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

export function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing Gemini API key in environment variables (GEMINI_API_KEY)');
  }
  return new GoogleGenerativeAI(apiKey);
}

export function getTextModel() {
  const genAI = getGenAI();
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.9,
      topP: 0.95,
      maxOutputTokens: 8192,
    }
  });
}

export function getVisionModel() {
  const genAI = getGenAI();
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash'
  });
}
