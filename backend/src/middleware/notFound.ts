import { Request, Response } from 'express';

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    code: 'NOT_FOUND',
    path: req.originalUrl,
    method: req.method
  });
};
