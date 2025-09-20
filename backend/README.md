# Finance Manager Backend API

A comprehensive backend API for the Personal Finance Management application built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- 🔐 **JWT Authentication** - Secure user authentication and authorization
- 💰 **Expense Management** - Track, categorize, and manage expenses
- 📊 **Budget Management** - Create and monitor budgets with spending alerts
- 📈 **Analytics** - Comprehensive spending analytics and insights
- 🤖 **AI Recommendations** - Intelligent financial advice using OpenAI
- 🏷️ **Category Management** - Customizable expense categories
- 📱 **RESTful API** - Clean, well-documented API endpoints

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB
- **ORM**: Prisma
- **Authentication**: JWT
- **AI**: OpenAI GPT-3.5-turbo
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Database
   DATABASE_URL="mongodb+srv://aarjav100jain_db_user:aGPYcbdyPVy3j7AF@cluster0.redhzw9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
   
   # JWT
   JWT_SECRET="your-super-secret-jwt-key-here"
   JWT_EXPIRES_IN="7d"
   
   # Server
   PORT=3001
   NODE_ENV="development"
   
   # CORS
   CORS_ORIGIN="http://localhost:5173"
   
   # OpenAI (for AI recommendations)
   OPENAI_API_KEY="your-openai-api-key-here"
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Expenses
- `GET /api/expenses` - Get all expenses (with filters)
- `GET /api/expenses/stats` - Get expense statistics
- `GET /api/expenses/:id` - Get specific expense
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Budgets
- `GET /api/budgets` - Get all budgets
- `GET /api/budgets/stats` - Get budget statistics
- `GET /api/budgets/:id` - Get specific budget
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/default` - Get default categories
- `GET /api/categories/:id` - Get specific category
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Analytics
- `GET /api/analytics` - Get comprehensive analytics
- `GET /api/analytics/monthly-trend` - Get monthly spending trend
- `GET /api/analytics/daily-trend` - Get daily spending trend
- `GET /api/analytics/spending-by-period` - Get spending by time periods

### AI Recommendations
- `GET /api/ai/recommendations` - Get AI-powered recommendations
- `GET /api/ai/spending-data` - Get spending data for AI analysis

## Database Schema

The application uses the following main entities:

- **Users** - User accounts and authentication
- **Profiles** - User profile information
- **ExpenseCategories** - Categories for expenses (with icons and colors)
- **Expenses** - Individual expense records
- **Budgets** - Budget tracking by category and period

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

### Project Structure

```
backend/
├── src/
│   ├── lib/
│   │   └── prisma.ts          # Prisma client configuration
│   ├── middleware/
│   │   ├── auth.ts            # JWT authentication middleware
│   │   ├── errorHandler.ts    # Error handling middleware
│   │   ├── notFound.ts        # 404 handler
│   │   └── validation.ts      # Request validation middleware
│   ├── routes/
│   │   ├── auth.ts            # Authentication routes
│   │   ├── users.ts           # User management routes
│   │   ├── expenses.ts        # Expense management routes
│   │   ├── budgets.ts         # Budget management routes
│   │   ├── categories.ts      # Category management routes
│   │   ├── analytics.ts       # Analytics routes
│   │   └── ai.ts              # AI recommendations routes
│   ├── services/
│   │   ├── authService.ts     # Authentication business logic
│   │   ├── expenseService.ts  # Expense management logic
│   │   ├── budgetService.ts   # Budget management logic
│   │   ├── categoryService.ts # Category management logic
│   │   ├── analyticsService.ts # Analytics logic
│   │   └── aiService.ts       # AI recommendations logic
│   ├── seed.ts                # Database seeding script
│   └── index.ts               # Application entry point
├── prisma/
│   └── schema.prisma          # Database schema
├── package.json
├── tsconfig.json
└── README.md
```

## Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt for password security
- **Rate Limiting** - Prevent API abuse
- **CORS Protection** - Configured for specific origins
- **Helmet** - Security headers
- **Input Validation** - Joi schema validation
- **SQL Injection Protection** - Prisma ORM protection

## Error Handling

The API includes comprehensive error handling with:

- Standardized error responses
- HTTP status codes
- Error codes for client handling
- Detailed error messages in development
- Logging for debugging

## Demo Account

After running the seed script, you can use the demo account:

- **Email**: demo@financemanager.com
- **Password**: demo123

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
