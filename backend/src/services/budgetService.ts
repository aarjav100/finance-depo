import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export interface CreateBudgetData {
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  categoryId?: string;
}

export interface UpdateBudgetData {
  amount?: number;
  period?: 'weekly' | 'monthly' | 'yearly';
  startDate?: Date;
  isActive?: boolean;
  categoryId?: string;
}

export interface BudgetWithSpent {
  id: string;
  amount: number;
  period: string;
  startDate: Date;
  isActive: boolean;
  categoryId: string | null;
  category: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  } | null;
  spent: number;
  percentage: number;
  remaining: number;
  endDate: Date;
}

export class BudgetService {
  static async createBudget(userId: string, data: CreateBudgetData) {
    // Verify category exists and belongs to user (if provided)
    if (data.categoryId) {
      const category = await prisma.expenseCategory.findFirst({
        where: {
          id: data.categoryId,
          OR: [
            { userId },
            { isDefault: true }
          ]
        }
      });

      if (!category) {
        throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
      }

      // Check if active budget already exists for this category
      const existingBudget = await prisma.budget.findFirst({
        where: {
          userId,
          categoryId: data.categoryId,
          isActive: true
        }
      });

      if (existingBudget) {
        throw new AppError('Active budget already exists for this category', 409, 'BUDGET_EXISTS');
      }
    }

    const budget = await prisma.budget.create({
      data: {
        ...data,
        userId,
        categoryId: data.categoryId || null
      },
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

    return budget;
  }

  static async getBudgets(userId: string, activeOnly: boolean = true) {
    const where: any = { userId };
    if (activeOnly) {
      where.isActive = true;
    }

    const budgets = await prisma.budget.findMany({
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
      orderBy: { createdAt: 'desc' }
    });

    // Calculate spent amounts for each budget
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const endDate = this.getEndDateForPeriod(new Date(budget.startDate), budget.period);
        
        const expenses = await prisma.expense.findMany({
          where: {
            userId,
            categoryId: budget.categoryId,
            expenseDate: {
              gte: budget.startDate,
              lt: endDate
            }
          },
          select: { amount: true }
        });

        const spent = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
        const percentage = (spent / Number(budget.amount)) * 100;
        const remaining = Number(budget.amount) - spent;

        return {
          ...budget,
          spent,
          percentage,
          remaining,
          endDate
        } as BudgetWithSpent;
      })
    );

    return budgetsWithSpent;
  }

  static async getBudgetById(userId: string, budgetId: string) {
    const budget = await prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId
      },
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

    if (!budget) {
      throw new AppError('Budget not found', 404, 'BUDGET_NOT_FOUND');
    }

    // Calculate spent amount
    const endDate = this.getEndDateForPeriod(new Date(budget.startDate), budget.period);
    
    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        categoryId: budget.categoryId,
        expenseDate: {
          gte: budget.startDate,
          lt: endDate
        }
      },
      select: { amount: true }
    });

    const spent = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const percentage = (spent / Number(budget.amount)) * 100;
    const remaining = Number(budget.amount) - spent;

    return {
      ...budget,
      spent,
      percentage,
      remaining,
      endDate
    } as BudgetWithSpent;
  }

  static async updateBudget(userId: string, budgetId: string, data: UpdateBudgetData) {
    // Verify budget exists and belongs to user
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId
      }
    });

    if (!existingBudget) {
      throw new AppError('Budget not found', 404, 'BUDGET_NOT_FOUND');
    }

    // Verify category exists and belongs to user (if provided)
    if (data.categoryId) {
      const category = await prisma.expenseCategory.findFirst({
        where: {
          id: data.categoryId,
          OR: [
            { userId },
            { isDefault: true }
          ]
        }
      });

      if (!category) {
        throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
      }

      // Check if active budget already exists for this category (excluding current budget)
      if (data.categoryId !== existingBudget.categoryId) {
        const existingCategoryBudget = await prisma.budget.findFirst({
          where: {
            userId,
            categoryId: data.categoryId,
            isActive: true,
            id: { not: budgetId }
          }
        });

        if (existingCategoryBudget) {
          throw new AppError('Active budget already exists for this category', 409, 'BUDGET_EXISTS');
        }
      }
    }

    const budget = await prisma.budget.update({
      where: { id: budgetId },
      data: {
        ...data,
        categoryId: data.categoryId || null
      },
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

    return budget;
  }

  static async deleteBudget(userId: string, budgetId: string) {
    const budget = await prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId
      }
    });

    if (!budget) {
      throw new AppError('Budget not found', 404, 'BUDGET_NOT_FOUND');
    }

    // Soft delete by setting isActive to false
    await prisma.budget.update({
      where: { id: budgetId },
      data: { isActive: false }
    });

    return { message: 'Budget deleted successfully' };
  }

  static async getBudgetStats(userId: string) {
    const [totalBudgets, activeBudgets, budgetsWithSpent] = await Promise.all([
      prisma.budget.count({ where: { userId } }),
      prisma.budget.count({ where: { userId, isActive: true } }),
      this.getBudgets(userId, true)
    ]);

    const totalBudgetAmount = budgetsWithSpent.reduce((sum, budget) => sum + Number(budget.amount), 0);
    const totalSpent = budgetsWithSpent.reduce((sum, budget) => sum + budget.spent, 0);
    const totalRemaining = totalBudgetAmount - totalSpent;
    const averageUtilization = budgetsWithSpent.length > 0 
      ? budgetsWithSpent.reduce((sum, budget) => sum + budget.percentage, 0) / budgetsWithSpent.length 
      : 0;

    const overBudget = budgetsWithSpent.filter(budget => budget.percentage >= 100).length;
    const nearLimit = budgetsWithSpent.filter(budget => budget.percentage >= 90 && budget.percentage < 100).length;

    return {
      totalBudgets,
      activeBudgets,
      totalBudgetAmount,
      totalSpent,
      totalRemaining,
      averageUtilization,
      overBudget,
      nearLimit,
      budgets: budgetsWithSpent
    };
  }

  private static getEndDateForPeriod(startDate: Date, period: string): Date {
    const endDate = new Date(startDate);
    switch (period) {
      case 'weekly':
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }
    return endDate;
  }
}
