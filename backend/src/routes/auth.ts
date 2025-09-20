import express from 'express';
import { AuthService } from '../services/authService';
import { validate, schemas } from '../middleware/validation';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', validate(schemas.signUp), async (req, res, next) => {
  try {
    const result = await AuthService.signUp(req.body);
    
    res.status(201).json({
      message: 'User created successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/signin
router.post('/signin', validate(schemas.signIn), async (req, res, next) => {
  try {
    const result = await AuthService.signIn(req.body);
    
    res.json({
      message: 'Sign in successful',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const user = await AuthService.getUserById(req.user!.id);
    
    res.json({
      message: 'User profile retrieved successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, validate(schemas.updateProfile), async (req: AuthRequest, res, next) => {
  try {
    const user = await AuthService.updateProfile(req.user!.id, req.body);
    
    res.json({
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
