import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export interface CreateCategoryData {
  name: string;
  icon?: string;
  color?: string;
}

export interface UpdateCategoryData {
  name?: string;
  icon?: string;
  color?: string;
}

export class CategoryService {
  static async createCategory(userId: string, data: CreateCategoryData) {
    // Check if category with same name already exists for user
    const existingCategory = await prisma.expenseCategory.findFirst({
      where: {
        name: data.name,
        userId
      }
    });

    if (existingCategory) {
      throw new AppError('Category with this name already exists', 409, 'CATEGORY_EXISTS');
    }

    const category = await prisma.expenseCategory.create({
      data: {
        ...data,
        userId
      }
    });

    return category;
  }

  static async getCategories(userId: string) {
    const categories = await prisma.expenseCategory.findMany({
      where: {
        OR: [
          { userId },
          { isDefault: true }
        ]
      },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' }
      ]
    });

    return categories;
  }

  static async getCategoryById(userId: string, categoryId: string) {
    const category = await prisma.expenseCategory.findFirst({
      where: {
        id: categoryId,
        OR: [
          { userId },
          { isDefault: true }
        ]
      }
    });

    if (!category) {
      throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    return category;
  }

  static async updateCategory(userId: string, categoryId: string, data: UpdateCategoryData) {
    // Verify category exists and belongs to user (not default)
    const existingCategory = await prisma.expenseCategory.findFirst({
      where: {
        id: categoryId,
        userId,
        isDefault: false
      }
    });

    if (!existingCategory) {
      throw new AppError('Category not found or cannot be modified', 404, 'CATEGORY_NOT_FOUND');
    }

    // Check if new name conflicts with existing category
    if (data.name && data.name !== existingCategory.name) {
      const conflictingCategory = await prisma.expenseCategory.findFirst({
        where: {
          name: data.name,
          userId,
          id: { not: categoryId }
        }
      });

      if (conflictingCategory) {
        throw new AppError('Category with this name already exists', 409, 'CATEGORY_EXISTS');
      }
    }

    const category = await prisma.expenseCategory.update({
      where: { id: categoryId },
      data
    });

    return category;
  }

  static async deleteCategory(userId: string, categoryId: string) {
    // Verify category exists and belongs to user (not default)
    const category = await prisma.expenseCategory.findFirst({
      where: {
        id: categoryId,
        userId,
        isDefault: false
      }
    });

    if (!category) {
      throw new AppError('Category not found or cannot be deleted', 404, 'CATEGORY_NOT_FOUND');
    }

    // Check if category is being used by expenses or budgets
    const [expenseCount, budgetCount] = await Promise.all([
      prisma.expense.count({
        where: { categoryId }
      }),
      prisma.budget.count({
        where: { categoryId }
      })
    ]);

    if (expenseCount > 0 || budgetCount > 0) {
      throw new AppError(
        `Cannot delete category. It is being used by ${expenseCount} expenses and ${budgetCount} budgets.`,
        409,
        'CATEGORY_IN_USE'
      );
    }

    await prisma.expenseCategory.delete({
      where: { id: categoryId }
    });

    return { message: 'Category deleted successfully' };
  }

  static async getDefaultCategories() {
    const categories = await prisma.expenseCategory.findMany({
      where: { isDefault: true },
      orderBy: { name: 'asc' }
    });

    return categories;
  }

  static async createDefaultCategories() {
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

    const existingDefaultCategories = await prisma.expenseCategory.findMany({
      where: { isDefault: true }
    });

    if (existingDefaultCategories.length === 0) {
      await prisma.expenseCategory.createMany({
        data: defaultCategories.map(category => ({
          ...category,
          isDefault: true
        }))
      });
    }

    return defaultCategories;
  }
}
