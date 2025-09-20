import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export interface CreateExpenseData {
  amount: number;
  description: string;
  expenseDate: Date;
  categoryId?: string;
}

export interface UpdateExpenseData {
  amount?: number;
  description?: string;
  expenseDate?: Date;
  categoryId?: string;
}

export interface ExpenseFilters {
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export class ExpenseService {
  static async createExpense(userId: string, data: CreateExpenseData) {
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
    }

    const expense = await prisma.expense.create({
      data: {
        ...data,
        userId,
        categoryId: data.categoryId || null,
        expenseDate: new Date(data.expenseDate) // Convert string to Date object
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

    return expense;
  }

  static async getExpenses(userId: string, filters: ExpenseFilters = {}) {
    const {
      categoryId,
      startDate,
      endDate,
      limit = 50,
      offset = 0
    } = filters;

    const where: any = {
      userId
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) where.expenseDate.gte = startDate;
      if (endDate) where.expenseDate.lte = endDate;
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
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
        orderBy: { expenseDate: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.expense.count({ where })
    ]);

    return {
      expenses,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };
  }

  static async getExpenseById(userId: string, expenseId: string) {
    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
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

    if (!expense) {
      throw new AppError('Expense not found', 404, 'EXPENSE_NOT_FOUND');
    }

    return expense;
  }

  static async updateExpense(userId: string, expenseId: string, data: UpdateExpenseData) {
    // Verify expense exists and belongs to user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        userId
      }
    });

    if (!existingExpense) {
      throw new AppError('Expense not found', 404, 'EXPENSE_NOT_FOUND');
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
    }

    const expense = await prisma.expense.update({
      where: { id: expenseId },
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

    return expense;
  }

  static async deleteExpense(userId: string, expenseId: string) {
    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        userId
      }
    });

    if (!expense) {
      throw new AppError('Expense not found', 404, 'EXPENSE_NOT_FOUND');
    }

    await prisma.expense.delete({
      where: { id: expenseId }
    });

    return { message: 'Expense deleted successfully' };
  }

  static async getExpenseStats(userId: string, startDate?: Date, endDate?: Date) {
    const where: any = { userId };

    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) where.expenseDate.gte = startDate;
      if (endDate) where.expenseDate.lte = endDate;
    }

    const [totalExpenses, monthlyExpenses, categoryBreakdown] = await Promise.all([
      // Total expenses
      prisma.expense.aggregate({
        where,
        _sum: { amount: true },
        _count: { id: true }
      }),

      // Current month expenses
      prisma.expense.aggregate({
        where: {
          ...where,
          expenseDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
          }
        },
        _sum: { amount: true }
      }),

      // Category breakdown
      prisma.expense.groupBy({
        by: ['categoryId'],
        where,
        _sum: { amount: true },
        _count: { id: true },
        orderBy: { _sum: { amount: 'desc' } }
      })
    ]);

    // Get category details for breakdown
    const categoryIds = categoryBreakdown
      .map(item => item.categoryId)
      .filter(Boolean) as string[];

    const categories = await prisma.expenseCategory.findMany({
      where: {
        id: { in: categoryIds }
      },
      select: {
        id: true,
        name: true,
        icon: true,
        color: true
      }
    });

    const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

    const breakdown = categoryBreakdown.map(item => ({
      categoryId: item.categoryId,
      category: item.categoryId ? categoryMap.get(item.categoryId) : null,
      amount: item._sum.amount || 0,
      count: item._count.id
    }));

    return {
      totalAmount: totalExpenses._sum.amount || 0,
      totalCount: totalExpenses._count.id || 0,
      monthlyAmount: monthlyExpenses._sum.amount || 0,
      categoryBreakdown: breakdown
    };
  }
}
