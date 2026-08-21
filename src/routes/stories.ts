import { Router } from 'express';
import { generateStory } from '../services/storyGenerator';
import { StoryRequest } from '../types/index';
import { z } from 'zod';

const router = Router();

const storySchema = z.object({
  prompt: z.string().min(1).max(5000),
  genre: z.enum(['fantasy', 'sci-fi', 'horror', 'romance', 'mystery', 'adventure', 'nsfw']).optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
  tone: z.string().optional(),
  nsfw: z.boolean().optional()
});

// POST /api/stories/generate
router.post('/generate', async (req, res, next) => {
  try {
    const validated = storySchema.parse(req.body);
    const story = await generateStory(validated as StoryRequest);
    res.json({
      success: true,
      data: story
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/stories/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { getFromDatabase } = await import('../config/supabase');
    const story = await getFromDatabase('stories', req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found'
      });
    }

    res.json({
      success: true,
      data: story
    });
  } catch (error) {
    next(error);
  }
});

export default router;
