import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default categories
  console.log('📂 Creating default categories...');
  const defaultCategories = [
    { name: 'Food & Dining', icon: '🍽️', color: '#FF6B6B' },
    { name: 'Transportation', icon: '🚗', color: '#4ECDC4' },
    { name: 'Shopping', icon: '🛍️', color: '#45B7D1' },
    { name: 'Entertainment', icon: '🎬', color: '#96CEB4' },
    { name: 'Bills & Utilities', icon: '💡', color: '#FFEAA7' },
    { name: 'Healthcare', icon: '🏥', color: '#DDA0DD' },
    { name: 'Education', icon: '📚', color: '#98D8C8' },
    { name: 'Travel', icon: '✈️', color: '#F7DC6F' },
    { name: 'Groceries', icon: '🛒', color: '#BB8FCE' },
    { name: 'Other', icon: '💰', color: '#85C1E9' }
  ];

  for (const category of defaultCategories) {
    // Check if category already exists
    const existingCategory = await prisma.expenseCategory.findFirst({
      where: {
        name: category.name,
        isDefault: true
      }
    });

    if (!existingCategory) {
      await prisma.expenseCategory.create({
        data: {
          ...category,
          isDefault: true
        }
      });
    }
  }

  console.log('✅ Default categories created');

  // Create demo user
  console.log('👤 Creating demo user...');
  const hashedPassword = await bcrypt.hash('demo123', 12);
  
  // Check if demo user already exists
  let demoUser = await prisma.user.findUnique({
    where: { email: 'demo@financemanager.com' }
  });

  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        email: 'demo@financemanager.com',
        password: hashedPassword,
        fullName: 'Demo User'
      }
    });

    // Create profile for demo user
    await prisma.profile.create({
      data: {
        userId: demoUser.id,
        fullName: demoUser.fullName
      }
    });
  }

  console.log('✅ Demo user created');

  // Create some demo expenses
  console.log('💰 Creating demo expenses...');
  const categories = await prisma.expenseCategory.findMany({
    where: { isDefault: true }
  });

  const demoExpenses = [
    { amount: 25.50, description: 'Lunch at restaurant', categoryName: 'Food & Dining', daysAgo: 1 },
    { amount: 15.00, description: 'Uber ride', categoryName: 'Transportation', daysAgo: 2 },
    { amount: 89.99, description: 'Grocery shopping', categoryName: 'Groceries', daysAgo: 3 },
    { amount: 12.00, description: 'Netflix subscription', categoryName: 'Entertainment', daysAgo: 5 },
    { amount: 45.00, description: 'Gas bill', categoryName: 'Bills & Utilities', daysAgo: 7 },
    { amount: 120.00, description: 'Doctor visit', categoryName: 'Healthcare', daysAgo: 10 },
    { amount: 35.00, description: 'Coffee and snacks', categoryName: 'Food & Dining', daysAgo: 12 },
    { amount: 200.00, description: 'Online shopping', categoryName: 'Shopping', daysAgo: 15 },
    { amount: 18.50, description: 'Public transport', categoryName: 'Transportation', daysAgo: 18 },
    { amount: 75.00, description: 'Textbooks', categoryName: 'Education', daysAgo: 20 }
  ];

  for (const expense of demoExpenses) {
    const category = categories.find(cat => cat.name === expense.categoryName);
    const expenseDate = new Date();
    expenseDate.setDate(expenseDate.getDate() - expense.daysAgo);

    await prisma.expense.create({
      data: {
        amount: expense.amount,
        description: expense.description,
        expenseDate,
        userId: demoUser.id,
        categoryId: category?.id
      }
    });
  }

  console.log('✅ Demo expenses created');

  // Create demo budgets
  console.log('📊 Creating demo budgets...');
  const demoBudgets = [
    { amount: 500, period: 'monthly', categoryName: 'Food & Dining' },
    { amount: 200, period: 'monthly', categoryName: 'Transportation' },
    { amount: 100, period: 'monthly', categoryName: 'Entertainment' },
    { amount: 300, period: 'monthly', categoryName: 'Groceries' }
  ];

  for (const budget of demoBudgets) {
    const category = categories.find(cat => cat.name === budget.categoryName);
    const startDate = new Date();
    startDate.setDate(1); // Start of current month

    await prisma.budget.create({
      data: {
        amount: budget.amount,
        period: budget.period,
        startDate,
        userId: demoUser.id,
        categoryId: category?.id
      }
    });
  }

  console.log('✅ Demo budgets created');

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📋 Demo Account:');
  console.log('Email: demo@financemanager.com');
  console.log('Password: demo123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
