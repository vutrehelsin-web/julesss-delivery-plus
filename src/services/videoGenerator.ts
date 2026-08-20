import { VideoRequest, VideoResponse } from '../types/index';
import { v4 as uuidv4 } from 'uuid';
import { saveToDatabase } from '../config/supabase';

const VENICE_VIDEO_API_URL = 'https://api.venice.ai/api/v1/videos/generations';

export async function generateVideo(request: VideoRequest): Promise<VideoResponse> {
  const {
    prompt,
    imageUrl,
    duration = 5,
    aspectRatio = '16:9'
  } = request;

  const apiKey = process.env.VENICE_API_KEY;
  if (!apiKey) {
    throw new Error('Missing Venice API key');
  }

  try {
    const payload: any = {
      model: 'grok-imagine-text-to-video-private', // Modelo sin restricciones
      prompt: prompt,
      duration: `${duration}s`,
      aspect_ratio: aspectRatio
    };

    // Si hay imagen de inicio, agregarla
    if (imageUrl) {
      payload.image_url = imageUrl;
    }

    const response = await fetch(VENICE_VIDEO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Venice Video API error: ${error}`);
    }

    const data = (await response.json()) as any;
    const videoUrl = data.video?.url || data.url;

    if (!videoUrl) {
      throw new Error('No video generated');
    }

    const videoData = {
      id: uuidv4(),
      url: videoUrl,
      prompt,
      duration,
      aspect_ratio: aspectRatio,
      image_url: imageUrl,
      created_at: new Date().toISOString()
    };

    await saveToDatabase('videos', videoData);

    return {
      id: videoData.id,
      url: videoUrl,
      prompt,
      duration,
      createdAt: videoData.created_at
    };

  } catch (error) {
    console.error('Error generating video:', error);
    throw new Error('Failed to generate video');
  }
}

// Generar video desde imagen (image-to-video)
export async function generateVideoFromImage(
  imageUrl: string,
  prompt: string,
  duration: number = 5
): Promise<VideoResponse> {
  return generateVideo({
    prompt,
    imageUrl,
    duration
  });
}
