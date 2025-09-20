import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import expenseRoutes from './routes/expenses';
import budgetRoutes from './routes/budgets';
import categoryRoutes from './routes/categories';
import analyticsRoutes from './routes/analytics';
import aiRoutes from './routes/ai';
import locationRoutes from './routes/location';

// Load environment variables
dotenv.config();

// Test MongoDB connection on startup
import { prisma } from './lib/prisma';

async function testDatabaseConnection() {
  try {
    console.log('🔄 Attempting to connect to MongoDB Atlas...');
    await prisma.$connect();
    console.log('✅ MongoDB Atlas connected successfully');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`📊 MongoDB Atlas ready - Users: ${userCount}`);
  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed:', error instanceof Error ? error.message : 'Unknown error');
    console.log('🔄 Server will continue with limited functionality');
  }
}

// Test connection before starting server (non-blocking)
testDatabaseConnection();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration - Allow all origins in development
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',')
    : true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/location', locationRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Finance Manager API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health'
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
  console.log(`📈 Health check: http://localhost:${PORT}/health`);
});

export default app;
