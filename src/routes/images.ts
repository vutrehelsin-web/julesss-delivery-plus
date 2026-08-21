import { Router } from 'express';
import { generateImage, generateMultipleImages } from '../services/imageGenerator';
import { ImageRequest } from '../types/index';
import { z } from 'zod';

const router = Router();

const imageSchema = z.object({
  prompt: z.string().min(1).max(4000),
  negativePrompt: z.string().max(1000).optional(),
  width: z.number().min(256).max(2048).optional(),
  height: z.number().min(256).max(2048).optional(),
  seed: z.number().optional(),
  nsfw: z.boolean().optional(),
  count: z.number().min(1).max(4).optional()
});

// POST /api/images/generate
router.post('/generate', async (req, res, next) => {
  try {
    const validated = imageSchema.parse(req.body);
    const { count = 1, ...imageRequest } = validated;

    let images;
    if (count > 1) {
      images = await generateMultipleImages(imageRequest as ImageRequest, count);
    } else {
      images = [await generateImage(imageRequest as ImageRequest)];
    }

    res.json({
      success: true,
      data: images
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/images/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { getFromDatabase } = await import('../config/supabase');
    const image = await getFromDatabase('images', req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    res.json({
      success: true,
      data: image
    });
  } catch (error) {
    next(error);
  }
});

export default router;
