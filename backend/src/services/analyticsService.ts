import { prisma } from '../lib/prisma';

export interface CategoryBreakdown {
  categoryId: string | null;
  category: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  } | null;
  amount: number;
  count: number;
  percentage: number;
}

export interface MonthlyData {
  month: string;
  amount: number;
  count: number;
}

export interface DailyData {
  date: string;
  amount: number;
  count: number;
}

export interface AnalyticsData {
  totalExpenses: number;
  totalCount: number;
  monthlyExpenses: number;
  monthlyCount: number;
  averageDaily: number;
  categoryBreakdown: CategoryBreakdown[];
  monthlyTrend: MonthlyData[];
  dailyTrend: DailyData[];
  topCategories: CategoryBreakdown[];
  spendingByPeriod: {
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
    lastMonth: number;
    lastYear: number;
  };
}

export class AnalyticsService {
  static async getAnalytics(userId: string, startDate?: Date, endDate?: Date): Promise<AnalyticsData> {
    const where: any = { userId };

    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) where.expenseDate.gte = startDate;
      if (endDate) where.expenseDate.lte = endDate;
    }

    // Get all expenses for the period
    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true
          }
        }
      },
      orderBy: { expenseDate: 'desc' }
    });

    // Calculate basic stats
    const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const totalCount = expenses.length;

    // Current month expenses
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.expenseDate);
      return expenseDate >= currentMonth && expenseDate < nextMonth;
    });

    const monthlyAmount = monthlyExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const monthlyCount = monthlyExpenses.length;

    // Average daily spending (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const last30DaysExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.expenseDate);
      return expenseDate >= thirtyDaysAgo;
    });

    const averageDaily = last30DaysExpenses.length > 0 
      ? last30DaysExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0) / 30
      : 0;

    // Category breakdown
    const categoryMap = new Map<string, { amount: number; count: number; category: any }>();
    
    expenses.forEach(expense => {
      const categoryId = expense.categoryId || 'uncategorized';
      const category = expense.category || { id: 'uncategorized', name: 'Uncategorized', icon: '💰', color: '#6B7280' };
      
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, { amount: 0, count: 0, category });
      }
      
      const existing = categoryMap.get(categoryId)!;
      existing.amount += Number(expense.amount);
      existing.count += 1;
    });

    const categoryBreakdown: CategoryBreakdown[] = Array.from(categoryMap.values()).map(item => ({
      categoryId: item.category.id === 'uncategorized' ? null : item.category.id,
      category: item.category.id === 'uncategorized' ? null : item.category,
      amount: item.amount,
      count: item.count,
      percentage: totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);

    // Monthly trend (last 12 months)
    const monthlyTrend = await this.getMonthlyTrend(userId);

    // Daily trend (last 30 days)
    const dailyTrend = await this.getDailyTrend(userId);

    // Top categories (top 5)
    const topCategories = categoryBreakdown.slice(0, 5);

    // Spending by period
    const spendingByPeriod = await this.getSpendingByPeriod(userId);

    return {
      totalExpenses,
      totalCount,
      monthlyExpenses: monthlyAmount,
      monthlyCount,
      averageDaily,
      categoryBreakdown,
      monthlyTrend,
      dailyTrend,
      topCategories,
      spendingByPeriod
    };
  }

  static async getMonthlyTrend(userId: string): Promise<MonthlyData[]> {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        expenseDate: {
          gte: twelveMonthsAgo
        }
      },
      select: {
        amount: true,
        expenseDate: true
      }
    });

    const monthlyMap = new Map<string, { amount: number; count: number }>();

    expenses.forEach(expense => {
      const month = new Date(expense.expenseDate).toISOString().slice(0, 7); // YYYY-MM
      
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, { amount: 0, count: 0 });
      }
      
      const existing = monthlyMap.get(month)!;
      existing.amount += Number(expense.amount);
      existing.count += 1;
    });

    return Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        amount: data.amount,
        count: data.count
      }))
      .sort((a, b) => new Date(a.month + ' 1, 2000').getTime() - new Date(b.month + ' 1, 2000').getTime());
  }

  static async getDailyTrend(userId: string): Promise<DailyData[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        expenseDate: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        amount: true,
        expenseDate: true
      }
    });

    const dailyMap = new Map<string, { amount: number; count: number }>();

    expenses.forEach(expense => {
      const date = expense.expenseDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { amount: 0, count: 0 });
      }
      
      const existing = dailyMap.get(date)!;
      existing.amount += Number(expense.amount);
      existing.count += 1;
    });

    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: data.amount,
        count: data.count
      }))
      .sort((a, b) => new Date(a.date + ', 2000').getTime() - new Date(b.date + ', 2000').getTime());
  }

  static async getSpendingByPeriod(userId: string) {
    const now = new Date();
    
    // This week
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // This month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // This year
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Last month
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Last year
    const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
    const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31);

    const [
      thisWeekExpenses,
      thisMonthExpenses,
      thisYearExpenses,
      lastMonthExpenses,
      lastYearExpenses
    ] = await Promise.all([
      prisma.expense.aggregate({
        where: {
          userId,
          expenseDate: { gte: startOfWeek }
        },
        _sum: { amount: true }
      }),
      prisma.expense.aggregate({
        where: {
          userId,
          expenseDate: { gte: startOfMonth }
        },
        _sum: { amount: true }
      }),
      prisma.expense.aggregate({
        where: {
          userId,
          expenseDate: { gte: startOfYear }
        },
        _sum: { amount: true }
      }),
      prisma.expense.aggregate({
        where: {
          userId,
          expenseDate: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        },
        _sum: { amount: true }
      }),
      prisma.expense.aggregate({
        where: {
          userId,
          expenseDate: {
            gte: startOfLastYear,
            lte: endOfLastYear
          }
        },
        _sum: { amount: true }
      })
    ]);

    return {
      thisWeek: thisWeekExpenses._sum.amount || 0,
      thisMonth: thisMonthExpenses._sum.amount || 0,
      thisYear: thisYearExpenses._sum.amount || 0,
      lastMonth: lastMonthExpenses._sum.amount || 0,
      lastYear: lastYearExpenses._sum.amount || 0
    };
  }

  static async getOverview(userId: string) {
    // Get total expenses
    const totalExpensesResult = await prisma.expense.aggregate({
      where: { userId },
      _sum: { amount: true }
    });

    // Get monthly expenses (current month)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const monthlyExpensesResult = await prisma.expense.aggregate({
      where: {
        userId,
        expenseDate: {
          gte: currentMonth,
          lt: nextMonth
        }
      },
      _sum: { amount: true }
    });

    // Get categories count
    const categoriesCount = await prisma.expenseCategory.count({
      where: {
        OR: [
          { userId },
          { isDefault: true }
        ]
      }
    });

    // Get budgets count
    const budgetsCount = await prisma.budget.count({
      where: {
        userId,
        isActive: true
      }
    });

    return {
      totalExpenses: totalExpensesResult._sum.amount || 0,
      monthlyExpenses: monthlyExpensesResult._sum.amount || 0,
      categoriesCount,
      budgetsCount
    };
  }

  static async getCategoriesAnalytics(userId: string, startDate?: Date) {
    const where: any = { userId };
    
    if (startDate) {
      where.expenseDate = { gte: startDate };
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true
          }
        }
      }
    });

    const categoryMap = new Map<string, { amount: number; category: any }>();
    
    expenses.forEach(expense => {
      const categoryId = expense.categoryId || 'uncategorized';
      const category = expense.category || { id: 'uncategorized', name: 'Uncategorized', icon: '💰', color: '#6B7280' };
      
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, { amount: 0, category });
      }
      
      const existing = categoryMap.get(categoryId)!;
      existing.amount += Number(expense.amount);
    });

    return Array.from(categoryMap.values()).map(item => ({
      category: item.category.name,
      amount: item.amount,
      color: item.category.color || '#6B7280'
    }));
  }

  static async getMonthlyExpenses(userId: string, startDate?: Date) {
    const where: any = { userId };
    
    if (startDate) {
      where.expenseDate = { gte: startDate };
    }

    const expenses = await prisma.expense.findMany({
      where,
      select: {
        amount: true,
        expenseDate: true
      }
    });

    const monthlyMap = new Map<string, number>();

    expenses.forEach(expense => {
      const month = new Date(expense.expenseDate).toISOString().slice(0, 7); // YYYY-MM
      
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, 0);
      }
      
      monthlyMap.set(month, monthlyMap.get(month)! + Number(expense.amount));
    });

    return Array.from(monthlyMap.entries())
      .map(([month, amount]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        amount
      }))
      .sort((a, b) => new Date(a.month + ' 1, 2000').getTime() - new Date(b.month + ' 1, 2000').getTime());
  }

  static async getDailyExpenses(userId: string, startDate?: Date) {
    const where: any = { userId };
    
    if (startDate) {
      where.expenseDate = { gte: startDate };
    }

    const expenses = await prisma.expense.findMany({
      where,
      select: {
        amount: true,
        expenseDate: true
      }
    });

    const dailyMap = new Map<string, number>();

    expenses.forEach(expense => {
      const date = expense.expenseDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!dailyMap.has(date)) {
        dailyMap.set(date, 0);
      }
      
      dailyMap.set(date, dailyMap.get(date)! + Number(expense.amount));
    });

    return Array.from(dailyMap.entries())
      .map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount
      }))
      .sort((a, b) => new Date(a.date + ', 2000').getTime() - new Date(b.date + ', 2000').getTime());
  }
}
