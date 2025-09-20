// Mock database for development when MongoDB Atlas is not available
export interface User {
  id: string;
  email: string;
  password: string;
  fullName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  isDefault: boolean;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  expenseDate: Date;
  userId: string;
  categoryId?: string;
  createdAt: Date;
  updatedAt: Date;
  category?: ExpenseCategory;
}

export interface Budget {
  id: string;
  amount: number;
  period: string;
  startDate: Date;
  isActive: boolean;
  userId: string;
  categoryId?: string;
  createdAt: Date;
  updatedAt: Date;
  category?: ExpenseCategory;
}

// In-memory storage
const users: User[] = [];
const categories: ExpenseCategory[] = [];
const expenses: Expense[] = [];
const budgets: Budget[] = [];

// Initialize with demo data
const initializeDemoData = () => {
  // Demo user
  const demoUser: User = {
    id: 'demo-user-id',
    email: 'demo@financemanager.com',
    password: '$2a$12$DwtE2AaXSeN5/fj/QL4c0eYa7.gkZzsyhGNqZPgbn8C7A5LbHRdcu', // demo123
    fullName: 'Demo User',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  users.push(demoUser);

  // Default categories
  const defaultCategories = [
    { id: 'cat-1', name: 'Food & Dining', icon: '🍽️', color: '#FF6B6B', isDefault: true },
    { id: 'cat-2', name: 'Transportation', icon: '🚗', color: '#4ECDC4', isDefault: true },
    { id: 'cat-3', name: 'Shopping', icon: '🛍️', color: '#45B7D1', isDefault: true },
    { id: 'cat-4', name: 'Entertainment', icon: '🎬', color: '#96CEB4', isDefault: true },
    { id: 'cat-5', name: 'Bills & Utilities', icon: '💡', color: '#FFEAA7', isDefault: true },
    { id: 'cat-6', name: 'Healthcare', icon: '🏥', color: '#DDA0DD', isDefault: true },
    { id: 'cat-7', name: 'Education', icon: '📚', color: '#98D8C8', isDefault: true },
    { id: 'cat-8', name: 'Travel', icon: '✈️', color: '#F7DC6F', isDefault: true }
  ];

  defaultCategories.forEach(cat => {
    categories.push({
      ...cat,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  // Demo expenses
  const demoExpenses = [
    {
      id: 'exp-1',
      amount: 25.50,
      description: 'Lunch at restaurant',
      expenseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      userId: demoUser.id,
      categoryId: 'cat-1'
    },
    {
      id: 'exp-2',
      amount: 15.00,
      description: 'Uber ride',
      expenseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      userId: demoUser.id,
      categoryId: 'cat-2'
    },
    {
      id: 'exp-3',
      amount: 89.99,
      description: 'Online shopping',
      expenseDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      userId: demoUser.id,
      categoryId: 'cat-3'
    }
  ];

  demoExpenses.forEach(exp => {
    expenses.push({
      ...exp,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: categories.find(c => c.id === exp.categoryId)
    });
  });

  // Demo budgets
  const demoBudgets = [
    {
      id: 'budget-1',
      amount: 500.00,
      period: 'monthly',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      isActive: true,
      userId: demoUser.id,
      categoryId: 'cat-1'
    },
    {
      id: 'budget-2',
      amount: 200.00,
      period: 'monthly',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      isActive: true,
      userId: demoUser.id,
      categoryId: 'cat-2'
    }
  ];

  demoBudgets.forEach(budget => {
    budgets.push({
      ...budget,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: categories.find(c => c.id === budget.categoryId)
    });
  });
};

// Initialize demo data
initializeDemoData();

export const mockDatabase = {
  user: {
    findUnique: async (args: { where: { email: string } }): Promise<User | null> => {
      return users.find(u => u.email === args.where.email) || null;
    },
    findFirst: async (args: { where: { email: string } }): Promise<User | null> => {
      return users.find(u => u.email === args.where.email) || null;
    },
    create: async (args: { data: Omit<User, 'id' | 'createdAt' | 'updatedAt'> }): Promise<User> => {
      const newUser: User = {
        id: `user-${Date.now()}`,
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      users.push(newUser);
      return newUser;
    },
    count: async (): Promise<number> => {
      return users.length;
    }
  },
  expenseCategory: {
    findMany: async (args?: { where?: any }): Promise<ExpenseCategory[]> => {
      if (!args?.where) return categories;
      return categories.filter(cat => {
        if (args.where.OR) {
          return args.where.OR.some((condition: any) => {
            if (condition.userId) return cat.userId === condition.userId;
            if (condition.isDefault) return cat.isDefault === condition.isDefault;
            return false;
          });
        }
        return true;
      });
    },
    findFirst: async (args: { where: any }): Promise<ExpenseCategory | null> => {
      return categories.find(cat => {
        if (args.where.name && args.where.isDefault) {
          return cat.name === args.where.name && cat.isDefault === args.where.isDefault;
        }
        return false;
      }) || null;
    },
    create: async (args: { data: Omit<ExpenseCategory, 'id' | 'createdAt' | 'updatedAt'> }): Promise<ExpenseCategory> => {
      const newCategory: ExpenseCategory = {
        id: `cat-${Date.now()}`,
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      categories.push(newCategory);
      return newCategory;
    },
    count: async (args?: { where?: any }): Promise<number> => {
      if (!args?.where) return categories.length;
      return categories.filter(cat => {
        if (args.where.OR) {
          return args.where.OR.some((condition: any) => {
            if (condition.userId) return cat.userId === condition.userId;
            if (condition.isDefault) return cat.isDefault === condition.isDefault;
            return false;
          });
        }
        return true;
      }).length;
    }
  },
  expense: {
    findMany: async (args?: { where?: any; include?: any; orderBy?: any }): Promise<Expense[]> => {
      let filteredExpenses = expenses;
      
      if (args?.where) {
        filteredExpenses = expenses.filter(exp => {
          if (args.where.userId) return exp.userId === args.where.userId;
          if (args.where.categoryId) return exp.categoryId === args.where.categoryId;
          if (args.where.expenseDate) {
            if (args.where.expenseDate.gte) {
              return exp.expenseDate >= new Date(args.where.expenseDate.gte);
            }
            if (args.where.expenseDate.lte) {
              return exp.expenseDate <= new Date(args.where.expenseDate.lte);
            }
            if (args.where.expenseDate.lt) {
              return exp.expenseDate < new Date(args.where.expenseDate.lt);
            }
          }
          return true;
        });
      }

      if (args?.include?.category) {
        filteredExpenses = filteredExpenses.map(exp => ({
          ...exp,
          category: categories.find(c => c.id === exp.categoryId)
        }));
      }

      if (args?.orderBy) {
        filteredExpenses.sort((a, b) => {
          if (args.orderBy.expenseDate === 'desc') {
            return b.expenseDate.getTime() - a.expenseDate.getTime();
          }
          return a.expenseDate.getTime() - b.expenseDate.getTime();
        });
      }

      return filteredExpenses;
    },
    create: async (args: { data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>; include?: any }): Promise<Expense> => {
      const newExpense: Expense = {
        id: `exp-${Date.now()}`,
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (args.include?.category && newExpense.categoryId) {
        newExpense.category = categories.find(c => c.id === newExpense.categoryId);
      }

      expenses.push(newExpense);
      return newExpense;
    },
    delete: async (args: { where: { id: string } }): Promise<Expense> => {
      const index = expenses.findIndex(exp => exp.id === args.where.id);
      if (index === -1) throw new Error('Expense not found');
      return expenses.splice(index, 1)[0];
    },
    aggregate: async (args: { where?: any; _sum?: any }): Promise<{ _sum: { amount: number } }> => {
      let filteredExpenses = expenses;
      
      if (args.where) {
        filteredExpenses = expenses.filter(exp => {
          if (args.where.userId) return exp.userId === args.where.userId;
          if (args.where.expenseDate) {
            if (args.where.expenseDate.gte) {
              return exp.expenseDate >= new Date(args.where.expenseDate.gte);
            }
            if (args.where.expenseDate.lte) {
              return exp.expenseDate <= new Date(args.where.expenseDate.lte);
            }
            if (args.where.expenseDate.lt) {
              return exp.expenseDate < new Date(args.where.expenseDate.lt);
            }
          }
          return true;
        });
      }

      const total = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      return { _sum: { amount: total } };
    }
  },
  budget: {
    findMany: async (args?: { where?: any; include?: any; orderBy?: any }): Promise<Budget[]> => {
      let filteredBudgets = budgets;
      
      if (args?.where) {
        filteredBudgets = budgets.filter(budget => {
          if (args.where.userId) return budget.userId === args.where.userId;
          if (args.where.isActive !== undefined) return budget.isActive === args.where.isActive;
          return true;
        });
      }

      if (args?.include?.category) {
        filteredBudgets = filteredBudgets.map(budget => ({
          ...budget,
          category: categories.find(c => c.id === budget.categoryId)
        }));
      }

      if (args?.orderBy) {
        filteredBudgets.sort((a, b) => {
          if (args.orderBy.createdAt === 'desc') {
            return b.createdAt.getTime() - a.createdAt.getTime();
          }
          return a.createdAt.getTime() - b.createdAt.getTime();
        });
      }

      return filteredBudgets;
    },
    create: async (args: { data: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>; include?: any }): Promise<Budget> => {
      const newBudget: Budget = {
        id: `budget-${Date.now()}`,
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (args.include?.category && newBudget.categoryId) {
        newBudget.category = categories.find(c => c.id === newBudget.categoryId);
      }

      budgets.push(newBudget);
      return newBudget;
    },
    update: async (args: { where: { id: string }; data: any }): Promise<Budget> => {
      const index = budgets.findIndex(budget => budget.id === args.where.id);
      if (index === -1) throw new Error('Budget not found');
      budgets[index] = { ...budgets[index], ...args.data, updatedAt: new Date() };
      return budgets[index];
    },
    delete: async (args: { where: { id: string } }): Promise<Budget> => {
      const index = budgets.findIndex(budget => budget.id === args.where.id);
      if (index === -1) throw new Error('Budget not found');
      return budgets.splice(index, 1)[0];
    },
    count: async (args?: { where?: any }): Promise<number> => {
      if (!args?.where) return budgets.length;
      return budgets.filter(budget => {
        if (args.where.userId) return budget.userId === args.where.userId;
        if (args.where.isActive !== undefined) return budget.isActive === args.where.isActive;
        return true;
      }).length;
    }
  }
};
