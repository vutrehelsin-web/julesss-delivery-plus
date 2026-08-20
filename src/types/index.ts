export interface StoryRequest {
  prompt: string;
  genre?: string;
  length?: 'short' | 'medium' | 'long';
  tone?: string;
  nsfw?: boolean;
}

export interface StoryResponse {
  id: string;
  title: string;
  content: string;
  genre: string;
  createdAt: string;
}

export interface ImageRequest {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  seed?: number;
  nsfw?: boolean;
}

export interface ImageResponse {
  id: string;
  url: string;
  prompt: string;
  createdAt: string;
}

export interface VideoRequest {
  prompt: string;
  imageUrl?: string;
  duration?: number;
  aspectRatio?: string;
}

export interface VideoResponse {
  id: string;
  url: string;
  prompt: string;
  duration: number;
  createdAt: string;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}
