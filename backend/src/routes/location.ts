import express from 'express';
import { LocationService } from '../services/locationService';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/location/suggestions
router.get('/suggestions', async (req: AuthRequest, res, next) => {
  try {
    const { latitude, longitude, locationType } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Latitude and longitude are required'
      });
    }

    const suggestions = await LocationService.generateLocationSuggestions(
      req.user!.id,
      parseFloat(latitude as string),
      parseFloat(longitude as string),
      locationType as string
    );
    
    res.json({
      message: 'Location suggestions generated successfully',
      data: { suggestions }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/location/expense
router.post('/expense', async (req: AuthRequest, res, next) => {
  try {
    const { locationId, amount, category, description } = req.body;
    
    if (!locationId || !amount || !category) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Location ID, amount, and category are required'
      });
    }

    const expense = await LocationService.createLocationExpense(
      req.user!.id,
      locationId,
      amount,
      category,
      description
    );
    
    res.json({
      message: 'Location expense created successfully',
      data: { expense }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/location/analytics
router.get('/analytics', async (req: AuthRequest, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const analytics = await LocationService.getLocationAnalytics(
      req.user!.id,
      startDate as string,
      endDate as string
    );
    
    res.json({
      message: 'Location analytics retrieved successfully',
      data: analytics
    });
  } catch (error) {
    next(error);
  }
});

export default router;
