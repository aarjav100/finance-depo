import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors
      });
    }
    
    next();
  };
};

// Common validation schemas
export const schemas = {
  // Auth schemas
  signUp: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    fullName: Joi.string().min(2).max(100).required()
  }),
  
  signIn: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  // Expense schemas
  createExpense: Joi.object({
    amount: Joi.number().positive().precision(2).required(),
    description: Joi.string().min(1).max(500).required(),
    expenseDate: Joi.date().iso().required(),
    categoryId: Joi.string().optional()
  }),
  
  updateExpense: Joi.object({
    amount: Joi.number().positive().precision(2).optional(),
    description: Joi.string().min(1).max(500).optional(),
    expenseDate: Joi.date().iso().optional(),
    categoryId: Joi.string().optional()
  }),
  
  // Budget schemas
  createBudget: Joi.object({
    amount: Joi.number().positive().precision(2).required(),
    period: Joi.string().valid('weekly', 'monthly', 'yearly').required(),
    startDate: Joi.date().iso().required(),
    categoryId: Joi.string().optional()
  }),
  
  updateBudget: Joi.object({
    amount: Joi.number().positive().precision(2).optional(),
    period: Joi.string().valid('weekly', 'monthly', 'yearly').optional(),
    startDate: Joi.date().iso().optional(),
    isActive: Joi.boolean().optional(),
    categoryId: Joi.string().optional()
  }),
  
  // Category schemas
  createCategory: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    icon: Joi.string().max(10).optional(),
    color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional()
  }),
  
  updateCategory: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    icon: Joi.string().max(10).optional(),
    color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional()
  }),
  
  // User schemas
  updateProfile: Joi.object({
    fullName: Joi.string().min(2).max(100).optional(),
    avatarUrl: Joi.string().uri().optional()
  })
};
