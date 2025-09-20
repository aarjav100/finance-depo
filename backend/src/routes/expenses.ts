import express from 'express';
import { ExpenseService } from '../services/expenseService';
import { validate, schemas } from '../middleware/validation';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/expenses
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const {
      categoryId,
      startDate,
      endDate,
      limit = '50',
      offset = '0'
    } = req.query;

    const filters = {
      categoryId: categoryId as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    };

    const result = await ExpenseService.getExpenses(req.user!.id, filters);
    
    res.json({
      message: 'Expenses retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/expenses/stats
router.get('/stats', async (req: AuthRequest, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const stats = await ExpenseService.getExpenseStats(
      req.user!.id,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    
    res.json({
      message: 'Expense statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/expenses/:id
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const expense = await ExpenseService.getExpenseById(req.user!.id, req.params.id);
    
    res.json({
      message: 'Expense retrieved successfully',
      data: { expense }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/expenses
router.post('/', validate(schemas.createExpense), async (req: AuthRequest, res, next) => {
  try {
    const expense = await ExpenseService.createExpense(req.user!.id, req.body);
    
    res.status(201).json({
      message: 'Expense created successfully',
      data: { expense }
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/expenses/:id
router.put('/:id', validate(schemas.updateExpense), async (req: AuthRequest, res, next) => {
  try {
    const expense = await ExpenseService.updateExpense(req.user!.id, req.params.id, req.body);
    
    res.json({
      message: 'Expense updated successfully',
      data: { expense }
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const result = await ExpenseService.deleteExpense(req.user!.id, req.params.id);
    
    res.json({
      message: result.message,
      data: {}
    });
  } catch (error) {
    next(error);
  }
});

export default router;
