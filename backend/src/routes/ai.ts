import express from 'express';
import { AIService } from '../services/aiService';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/ai/recommendations
router.get('/recommendations', async (req: AuthRequest, res, next) => {
  try {
    const recommendations = await AIService.generateRecommendations(req.user!.id);
    
    res.json({
      message: 'AI recommendations generated successfully',
      data: { recommendations }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/recommendations
router.post('/recommendations', async (req: AuthRequest, res, next) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        error: 'Prompt is required',
        message: 'Please provide a prompt for AI recommendations'
      });
    }

    const recommendations = await AIService.generateCustomRecommendations(prompt);
    
    res.json({
      message: 'AI recommendations generated successfully',
      data: { recommendations }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/ai/spending-data
router.get('/spending-data', async (req: AuthRequest, res, next) => {
  try {
    const spendingData = await AIService.getSpendingData(req.user!.id);
    
    res.json({
      message: 'Spending data retrieved successfully',
      data: spendingData
    });
  } catch (error) {
    next(error);
  }
});

export default router;
