import express from 'express';
import { CategoryService } from '../services/categoryService';
import { validate, schemas } from '../middleware/validation';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/categories
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const categories = await CategoryService.getCategories(req.user!.id);
    
    res.json({
      message: 'Categories retrieved successfully',
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/categories/default
router.get('/default', async (req: AuthRequest, res, next) => {
  try {
    const categories = await CategoryService.getDefaultCategories();
    
    res.json({
      message: 'Default categories retrieved successfully',
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/categories/:id
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const category = await CategoryService.getCategoryById(req.user!.id, req.params.id);
    
    res.json({
      message: 'Category retrieved successfully',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/categories
router.post('/', validate(schemas.createCategory), async (req: AuthRequest, res, next) => {
  try {
    const category = await CategoryService.createCategory(req.user!.id, req.body);
    
    res.status(201).json({
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/categories/:id
router.put('/:id', validate(schemas.updateCategory), async (req: AuthRequest, res, next) => {
  try {
    const category = await CategoryService.updateCategory(req.user!.id, req.params.id, req.body);
    
    res.json({
      message: 'Category updated successfully',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const result = await CategoryService.deleteCategory(req.user!.id, req.params.id);
    
    res.json({
      message: result.message,
      data: {}
    });
  } catch (error) {
    next(error);
  }
});

export default router;
