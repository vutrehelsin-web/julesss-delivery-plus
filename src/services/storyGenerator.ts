import { textModel } from '../config/gemini';
import { StoryRequest, StoryResponse } from '../types/index';
import { v4 as uuidv4 } from 'uuid';
import { saveToDatabase } from '../config/supabase';

export async function generateStory(request: StoryRequest): Promise<StoryResponse> {
  const { prompt, genre = 'fantasy', length = 'medium', tone = 'dramatic', nsfw = false } = request;

  // Construir el prompt para Gemini
  let systemPrompt = `Eres un escritor creativo especializado en historias ${genre}. `;

  const lengthTokens: Record<'short' | 'medium' | 'long', string> = {
    short: 'Escribe una historia corta de aproximadamente 300-500 palabras.',
    medium: 'Escribe una historia de longitud media de aproximadamente 800-1200 palabras.',
    long: 'Escribe una historia larga de aproximadamente 2000-3000 palabras.'
  };

  systemPrompt += `${lengthTokens[length]} `;
  systemPrompt += `El tono debe ser ${tone}. `;

  if (nsfw) {
    systemPrompt += `Puedes incluir contenido adulto, explícito o NSFW si es relevante para la historia. `;
  }

  systemPrompt += `\n\nPrompt del usuario: ${prompt}\n\n`;
  systemPrompt += `Genera un título creativo y luego la historia. Formato:\nTÍTULO: [título]\n\nHISTORIA: [contenido]`;

  try {
    const result = await textModel.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    // Extraer título y contenido
    const titleMatch = text.match(/TÍTULO:\s*(.+?)(?=\n|$)/i);
    const contentMatch = text.match(/HISTORIA:\s*([\s\S]+)/i);

    const title = titleMatch ? titleMatch[1].trim() : 'Sin título';
    const content = contentMatch ? contentMatch[1].trim() : text;

    const storyData = {
      id: uuidv4(),
      title,
      content,
      genre,
      tone,
      length,
      nsfw,
      prompt,
      created_at: new Date().toISOString()
    };

    // Guardar en Supabase
    await saveToDatabase('stories', storyData);

    return {
      id: storyData.id,
      title,
      content,
      genre,
      createdAt: storyData.created_at
    };

  } catch (error) {
    console.error('Error generating story:', error);
    throw new Error('Failed to generate story');
  }
}
