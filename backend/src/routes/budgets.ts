import express from 'express';
import { BudgetService } from '../services/budgetService';
import { validate, schemas } from '../middleware/validation';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/budgets
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { activeOnly = 'true' } = req.query;
    const budgets = await BudgetService.getBudgets(req.user!.id, activeOnly === 'true');
    
    res.json({
      message: 'Budgets retrieved successfully',
      data: { budgets }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/budgets/stats
router.get('/stats', async (req: AuthRequest, res, next) => {
  try {
    const stats = await BudgetService.getBudgetStats(req.user!.id);
    
    res.json({
      message: 'Budget statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/budgets/:id
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const budget = await BudgetService.getBudgetById(req.user!.id, req.params.id);
    
    res.json({
      message: 'Budget retrieved successfully',
      data: { budget }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/budgets
router.post('/', validate(schemas.createBudget), async (req: AuthRequest, res, next) => {
  try {
    const budget = await BudgetService.createBudget(req.user!.id, req.body);
    
    res.status(201).json({
      message: 'Budget created successfully',
      data: { budget }
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/budgets/:id
router.put('/:id', validate(schemas.updateBudget), async (req: AuthRequest, res, next) => {
  try {
    const budget = await BudgetService.updateBudget(req.user!.id, req.params.id, req.body);
    
    res.json({
      message: 'Budget updated successfully',
      data: { budget }
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/budgets/:id
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const result = await BudgetService.deleteBudget(req.user!.id, req.params.id);
    
    res.json({
      message: result.message,
      data: {}
    });
  } catch (error) {
    next(error);
  }
});

export default router;
