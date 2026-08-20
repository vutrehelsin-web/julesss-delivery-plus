import { Router } from 'express';
import { generateVideo, generateVideoFromImage } from '../services/videoGenerator';
import { VideoRequest } from '../types/index';
import { z } from 'zod';

const router = Router();

const videoSchema = z.object({
  prompt: z.string().min(1).max(4000),
  imageUrl: z.string().url().optional(),
  duration: z.number().min(1).max(15).optional(),
  aspectRatio: z.enum(['16:9', '9:16', '1:1', '4:3']).optional()
});

// POST /api/videos/generate
router.post('/generate', async (req, res, next) => {
  try {
    const validated = videoSchema.parse(req.body);
    const video = await generateVideo(validated as VideoRequest);

    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/videos/from-image
router.post('/from-image', async (req, res, next) => {
  try {
    const { imageUrl, prompt, duration } = z.object({
      imageUrl: z.string().url(),
      prompt: z.string().min(1),
      duration: z.number().min(1).max(15).optional()
    }).parse(req.body);

    const video = await generateVideoFromImage(imageUrl, prompt, duration);

    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/videos/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { getFromDatabase } = await import('../config/supabase');
    const video = await getFromDatabase('videos', req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    next(error);
  }
});

export default router;
