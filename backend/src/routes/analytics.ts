import express from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/analytics
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const analytics = await AnalyticsService.getAnalytics(
      req.user!.id,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    
    res.json({
      message: 'Analytics data retrieved successfully',
      data: analytics
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/monthly-trend
router.get('/monthly-trend', async (req: AuthRequest, res, next) => {
  try {
    const monthlyTrend = await AnalyticsService.getMonthlyTrend(req.user!.id);
    
    res.json({
      message: 'Monthly trend data retrieved successfully',
      data: { monthlyTrend }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/daily-trend
router.get('/daily-trend', async (req: AuthRequest, res, next) => {
  try {
    const dailyTrend = await AnalyticsService.getDailyTrend(req.user!.id);
    
    res.json({
      message: 'Daily trend data retrieved successfully',
      data: { dailyTrend }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/spending-by-period
router.get('/spending-by-period', async (req: AuthRequest, res, next) => {
  try {
    const spendingByPeriod = await AnalyticsService.getSpendingByPeriod(req.user!.id);
    
    res.json({
      message: 'Spending by period data retrieved successfully',
      data: { spendingByPeriod }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/overview
router.get('/overview', async (req: AuthRequest, res, next) => {
  try {
    const overview = await AnalyticsService.getOverview(req.user!.id);
    
    res.json({
      message: 'Overview data retrieved successfully',
      data: overview
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/categories
router.get('/categories', async (req: AuthRequest, res, next) => {
  try {
    const { startDate } = req.query;
    const categories = await AnalyticsService.getCategoriesAnalytics(
      req.user!.id,
      startDate ? new Date(startDate as string) : undefined
    );
    
    res.json({
      message: 'Categories analytics retrieved successfully',
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/monthly
router.get('/monthly', async (req: AuthRequest, res, next) => {
  try {
    const { startDate } = req.query;
    const monthlyExpenses = await AnalyticsService.getMonthlyExpenses(
      req.user!.id,
      startDate ? new Date(startDate as string) : undefined
    );
    
    res.json({
      message: 'Monthly expenses retrieved successfully',
      data: { monthlyExpenses }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/daily
router.get('/daily', async (req: AuthRequest, res, next) => {
  try {
    const { startDate } = req.query;
    const dailyExpenses = await AnalyticsService.getDailyExpenses(
      req.user!.id,
      startDate ? new Date(startDate as string) : undefined
    );
    
    res.json({
      message: 'Daily expenses retrieved successfully',
      data: { dailyExpenses }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
