import express from 'express';
import { AuthService } from '../services/authService';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/users/profile
router.get('/profile', async (req: AuthRequest, res, next) => {
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

// PUT /api/users/profile
router.put('/profile', async (req: AuthRequest, res, next) => {
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
