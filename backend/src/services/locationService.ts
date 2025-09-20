import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export interface LocationSuggestion {
  location: {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    type: string;
    category: string;
  };
  suggestedExpense: {
    category: string;
    amount: number;
    description: string;
    confidence: number;
  };
  suggestedBudget: {
    category: string;
    monthlyAmount: number;
    reasoning: string;
  };
}

export interface LocationAnalytics {
  totalSpending: number;
  locationCount: number;
  topCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  spendingByLocation: Array<{
    locationName: string;
    amount: number;
    visitCount: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    amount: number;
  }>;
}

export class LocationService {
  static async generateLocationSuggestions(
    userId: string,
    latitude: number,
    longitude: number,
    locationType?: string
  ): Promise<LocationSuggestion[]> {
    try {
      // Mock AI-powered suggestions based on location and user history
      const suggestions: LocationSuggestion[] = [];
      
      // Get user's spending history for context
      const userExpenses = await prisma.expense.findMany({
        where: { userId },
        include: { category: true },
        orderBy: { expenseDate: 'desc' },
        take: 50
      });

      // Analyze spending patterns
      const categorySpending = userExpenses.reduce((acc, expense) => {
        const category = expense.category?.name || 'Other';
        if (!acc[category]) acc[category] = 0;
        acc[category] += Number(expense.amount);
        return acc;
      }, {} as Record<string, number>);

      const totalSpending = Object.values(categorySpending).reduce((sum, amount) => sum + amount, 0);
      const averageSpending = totalSpending / userExpenses.length || 0;

      // Generate suggestions based on location type
      const locationTypes = locationType ? [locationType] : ['restaurant', 'shopping', 'gas_station', 'entertainment'];
      
      for (const type of locationTypes) {
        const suggestion = this.generateSuggestionForType(
          type,
          latitude,
          longitude,
          categorySpending,
          averageSpending,
          userExpenses.length
        );
        
        if (suggestion) {
          suggestions.push(suggestion);
        }
      }

      return suggestions.slice(0, 3); // Return top 3 suggestions
    } catch (error) {
      console.error('Error generating location suggestions:', error);
      throw new AppError('Failed to generate location suggestions', 500, 'LOCATION_SUGGESTION_ERROR');
    }
  }

  private static generateSuggestionForType(
    type: string,
    latitude: number,
    longitude: number,
    categorySpending: Record<string, number>,
    averageSpending: number,
    transactionCount: number
  ): LocationSuggestion | null {
    const baseLocation = {
      id: `suggested_${type}_${Date.now()}`,
      name: this.getLocationNameForType(type),
      address: this.getAddressForCoordinates(latitude, longitude),
      latitude,
      longitude,
      type,
      category: this.getCategoryForType(type)
    };

    switch (type) {
      case 'restaurant':
        return {
          location: baseLocation,
          suggestedExpense: {
            category: 'Food & Dining',
            amount: Math.max(15, averageSpending * 0.8),
            description: `Dining at ${baseLocation.name}`,
            confidence: 0.85
          },
          suggestedBudget: {
            category: 'Food & Dining',
            monthlyAmount: Math.max(200, (categorySpending['Food & Dining'] || 0) * 1.2),
            reasoning: `Based on your dining patterns, consider budgeting $${Math.max(200, (categorySpending['Food & Dining'] || 0) * 1.2).toFixed(2)} monthly for restaurant expenses.`
          }
        };

      case 'shopping':
        return {
          location: baseLocation,
          suggestedExpense: {
            category: 'Shopping',
            amount: Math.max(50, averageSpending * 1.2),
            description: `Shopping at ${baseLocation.name}`,
            confidence: 0.75
          },
          suggestedBudget: {
            category: 'Shopping',
            monthlyAmount: Math.max(300, (categorySpending['Shopping'] || 0) * 1.1),
            reasoning: `Your shopping habits suggest a monthly budget of $${Math.max(300, (categorySpending['Shopping'] || 0) * 1.1).toFixed(2)} for retail purchases.`
          }
        };

      case 'gas_station':
        return {
          location: baseLocation,
          suggestedExpense: {
            category: 'Transportation',
            amount: Math.max(40, averageSpending * 0.9),
            description: `Fuel at ${baseLocation.name}`,
            confidence: 0.90
          },
          suggestedBudget: {
            category: 'Transportation',
            monthlyAmount: Math.max(150, (categorySpending['Transportation'] || 0) * 1.05),
            reasoning: `Based on your fuel consumption, budget $${Math.max(150, (categorySpending['Transportation'] || 0) * 1.05).toFixed(2)} monthly for gas expenses.`
          }
        };

      case 'entertainment':
        return {
          location: baseLocation,
          suggestedExpense: {
            category: 'Entertainment',
            amount: Math.max(25, averageSpending * 0.7),
            description: `Entertainment at ${baseLocation.name}`,
            confidence: 0.70
          },
          suggestedBudget: {
            category: 'Entertainment',
            monthlyAmount: Math.max(100, (categorySpending['Entertainment'] || 0) * 1.15),
            reasoning: `Your entertainment spending suggests a monthly budget of $${Math.max(100, (categorySpending['Entertainment'] || 0) * 1.15).toFixed(2)} for leisure activities.`
          }
        };

      default:
        return null;
    }
  }

  private static getLocationNameForType(type: string): string {
    const names = {
      restaurant: 'Local Restaurant',
      shopping: 'Shopping Center',
      gas_station: 'Gas Station',
      entertainment: 'Entertainment Venue',
      work: 'Office Building',
      home: 'Residential Area'
    };
    return names[type as keyof typeof names] || 'Unknown Location';
  }

  private static getCategoryForType(type: string): string {
    const categories = {
      restaurant: 'Food & Dining',
      shopping: 'Shopping',
      gas_station: 'Transportation',
      entertainment: 'Entertainment',
      work: 'Work',
      home: 'Housing'
    };
    return categories[type as keyof typeof categories] || 'Other';
  }

  private static getAddressForCoordinates(lat: number, lng: number): string {
    // Mock address generation - in real app, use reverse geocoding
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }

  static async createLocationExpense(
    userId: string,
    locationId: string,
    amount: number,
    category: string,
    description?: string
  ) {
    try {
      // Find or create category
      let categoryRecord = await prisma.expenseCategory.findFirst({
        where: { name: category, userId }
      });

      if (!categoryRecord) {
        categoryRecord = await prisma.expenseCategory.create({
          data: {
            name: category,
            userId,
            icon: 'DollarSign',
            color: 'blue'
          }
        });
      }

      // Create expense
      const expense = await prisma.expense.create({
        data: {
          amount,
          description: description || `Location-based expense at ${locationId}`,
          expenseDate: new Date(),
          userId,
          categoryId: categoryRecord.id,
          // Add location metadata if needed
        }
      });

      return expense;
    } catch (error) {
      console.error('Error creating location expense:', error);
      throw new AppError('Failed to create location expense', 500, 'LOCATION_EXPENSE_ERROR');
    }
  }

  static async getLocationAnalytics(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<LocationAnalytics> {
    try {
      const whereClause: any = { userId };
      
      if (startDate && endDate) {
        whereClause.expenseDate = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      }

      const expenses = await prisma.expense.findMany({
        where: whereClause,
        include: { category: true }
      });

      const totalSpending = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      
      // Calculate category breakdown
      const categoryTotals = expenses.reduce((acc, expense) => {
        const category = expense.category?.name || 'Other';
        if (!acc[category]) acc[category] = 0;
        acc[category] += Number(expense.amount);
        return acc;
      }, {} as Record<string, number>);

      const topCategories = Object.entries(categoryTotals)
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: (amount / totalSpending) * 100
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      // Mock location-based spending (in real app, this would come from location data)
      const spendingByLocation = [
        { locationName: 'Downtown Area', amount: totalSpending * 0.4, visitCount: 15 },
        { locationName: 'Shopping Mall', amount: totalSpending * 0.3, visitCount: 8 },
        { locationName: 'Gas Station', amount: totalSpending * 0.2, visitCount: 12 },
        { locationName: 'Restaurant District', amount: totalSpending * 0.1, visitCount: 6 }
      ];

      // Mock monthly trends
      const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return {
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          amount: totalSpending * (0.8 + Math.random() * 0.4) / 6
        };
      }).reverse();

      return {
        totalSpending,
        locationCount: spendingByLocation.length,
        topCategories,
        spendingByLocation,
        monthlyTrends
      };
    } catch (error) {
      console.error('Error getting location analytics:', error);
      throw new AppError('Failed to get location analytics', 500, 'LOCATION_ANALYTICS_ERROR');
    }
  }
}
