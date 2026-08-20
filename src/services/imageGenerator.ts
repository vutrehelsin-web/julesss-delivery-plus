import { ImageRequest, ImageResponse } from '../types/index';
import { v4 as uuidv4 } from 'uuid';
import { saveToDatabase } from '../config/supabase';

const VENICE_API_URL = 'https://api.venice.ai/api/v1/images/generations';

export async function generateImage(request: ImageRequest): Promise<ImageResponse> {
  const {
    prompt,
    negativePrompt = '',
    width = 1024,
    height = 1024,
    seed,
    nsfw = true
  } = request;

  const apiKey = process.env.VENICE_API_KEY;
  if (!apiKey) {
    throw new Error('Missing Venice API key');
  }

  try {
    const response = await fetch(VENICE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'chroma', // Modelo sin censura de Venice
        prompt: prompt,
        negative_prompt: negativePrompt,
        width: width,
        height: height,
        seed: seed || Math.floor(Math.random() * 1000000),
        // Venice permite contenido NSFW sin restricciones
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Venice API error: ${error}`);
    }

    const data = (await response.json()) as any;
    const imageUrl = data.images?.[0]?.url;

    if (!imageUrl) {
      throw new Error('No image generated');
    }

    const imageData = {
      id: uuidv4(),
      url: imageUrl,
      prompt,
      negative_prompt: negativePrompt,
      width,
      height,
      seed,
      nsfw,
      created_at: new Date().toISOString()
    };

    await saveToDatabase('images', imageData);

    return {
      id: imageData.id,
      url: imageUrl,
      prompt,
      createdAt: imageData.created_at
    };

  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error('Failed to generate image');
  }
}

// Generar múltiples imágenes
export async function generateMultipleImages(
  request: ImageRequest,
  count: number = 1
): Promise<ImageResponse[]> {
  const promises = Array(count).fill(null).map(() => generateImage(request));
  return Promise.all(promises);
}
