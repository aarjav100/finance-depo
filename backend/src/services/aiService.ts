import OpenAI from 'openai';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export interface SpendingData {
  totalExpenses: number;
  monthlyExpenses: number;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  budgetStatus: Array<{
    category: string;
    budget: number;
    spent: number;
    percentage: number;
  }>;
}

export interface Recommendation {
  type: 'savings' | 'budget' | 'category' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
}

export class AIService {
  private static openai: OpenAI | null = null;

  private static getOpenAI(): OpenAI {
    if (!this.openai) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new AppError('OpenAI API key not configured', 500, 'AI_SERVICE_UNAVAILABLE');
      }
      this.openai = new OpenAI({ apiKey });
    }
    return this.openai;
  }

  static async getSpendingData(userId: string): Promise<SpendingData> {
    // Get all expenses
    const allExpenses = await prisma.expense.findMany({
      where: { userId },
      include: {
        category: {
          select: { name: true }
        }
      }
    });

    // Get current month expenses
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyExpenses = allExpenses.filter(expense => 
      expense.expenseDate.toISOString().startsWith(currentMonth)
    );

    // Calculate category breakdown
    const categoryTotals = allExpenses.reduce((acc: Record<string, number>, expense) => {
      const category = expense.category?.name || 'Other';
      if (!acc[category]) acc[category] = 0;
      acc[category] += Number(expense.amount);
      return acc;
    }, {});

    const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    const categoryBreakdown = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / totalExpenses) * 100
    })).sort((a, b) => b.amount - a.amount);

    // Get budget status
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        isActive: true
      },
      include: {
        category: {
          select: { name: true }
        }
      }
    });

    const budgetStatus = await Promise.all(
      budgets.map(async (budget) => {
        const startDate = new Date(budget.startDate);
        const endDate = this.getEndDateForPeriod(startDate, budget.period);
        
        const expenses = await prisma.expense.findMany({
          where: {
            userId,
            categoryId: budget.categoryId,
            expenseDate: {
              gte: startDate,
              lt: endDate
            }
          },
          select: { amount: true }
        });

        const spent = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
        const budgetAmount = Number(budget.amount);

        return {
          category: budget.category?.name || 'Other',
          budget: budgetAmount,
          spent,
          percentage: (spent / budgetAmount) * 100
        };
      })
    );

    return {
      totalExpenses,
      monthlyExpenses: monthlyExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0),
      categoryBreakdown,
      budgetStatus
    };
  }

  static async generateRecommendations(userId: string): Promise<Recommendation[]> {
    try {
      const spendingData = await this.getSpendingData(userId);
      
      // Generate rule-based recommendations
      const ruleBasedRecs = this.generateRuleBasedRecommendations(spendingData);
      
      // Generate AI recommendations if OpenAI is available
      let aiRecs: Recommendation[] = [];
      try {
        aiRecs = await this.generateAIRecommendations(spendingData);
      } catch (error) {
        console.warn('AI recommendations failed, using rule-based only:', error);
      }

      return [...ruleBasedRecs, ...aiRecs];
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw new AppError('Failed to generate recommendations', 500, 'RECOMMENDATION_ERROR');
    }
  }

  static async generateCustomRecommendations(prompt: string): Promise<Recommendation[]> {
    try {
      // Check if OpenAI is available
      if (!process.env.OPENAI_API_KEY) {
        console.warn('OpenAI API key not configured, returning fallback recommendations');
        return this.getFallbackRecommendations();
      }

      const openai = this.getOpenAI();

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a personal finance advisor. Provide practical, actionable recommendations based on the provided spending data. Always respond with valid JSON array format with the following structure: [{"type": "savings|budget|category|trend", "title": "Title", "description": "Description", "impact": "high|medium|low", "actionable": true}]'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI');
      }

      try {
        const recommendations = JSON.parse(response);
        return Array.isArray(recommendations) ? recommendations : [];
      } catch (error) {
        console.error('Failed to parse AI response:', response);
        // Fallback: try to extract recommendations from text
        return this.parseTextRecommendations(response);
      }
    } catch (error) {
      console.error('Error generating custom AI recommendations:', error);
      // Return fallback recommendations instead of throwing error
      return this.getFallbackRecommendations();
    }
  }

  private static generateRuleBasedRecommendations(data: SpendingData): Recommendation[] {
    const recs: Recommendation[] = [];

    // High spending category recommendation
    if (data.categoryBreakdown.length > 0) {
      const topCategory = data.categoryBreakdown[0];
      if (topCategory.percentage > 40) {
        recs.push({
          type: 'category',
          title: `High ${topCategory.category} Spending`,
          description: `${topCategory.category} represents ${topCategory.percentage.toFixed(1)}% of your expenses ($${topCategory.amount.toFixed(2)}). Consider reviewing these expenses for potential savings.`,
          impact: 'high',
          actionable: true
        });
      }
    }

    // Budget alerts
    data.budgetStatus.forEach(budget => {
      if (budget.percentage >= 90) {
        recs.push({
          type: 'budget',
          title: `Budget Alert: ${budget.category}`,
          description: `You've spent ${budget.percentage.toFixed(1)}% of your ${budget.category} budget ($${budget.spent.toFixed(2)} of $${budget.budget.toFixed(2)}).`,
          impact: budget.percentage >= 100 ? 'high' : 'medium',
          actionable: true
        });
      }
    });

    // Savings opportunity
    if (data.monthlyExpenses > 0) {
      const dailyAverage = data.monthlyExpenses / new Date().getDate();
      recs.push({
        type: 'savings',
        title: 'Daily Spending Insight',
        description: `Your daily average spending this month is $${dailyAverage.toFixed(2)}. Reducing by just 10% could save you $${(dailyAverage * 0.1 * 30).toFixed(2)} per month.`,
        impact: 'medium',
        actionable: true
      });
    }

    // General financial health
    if (data.categoryBreakdown.length > 5) {
      recs.push({
        type: 'trend',
        title: 'Spending Diversification',
        description: `You have expenses across ${data.categoryBreakdown.length} categories. Consider consolidating similar expenses or focusing on your top 3-4 spending categories for better budget control.`,
        impact: 'low',
        actionable: true
      });
    }

    return recs;
  }

  private static async generateAIRecommendations(data: SpendingData): Promise<Recommendation[]> {
    const openai = this.getOpenAI();

    const prompt = `As a personal finance advisor, analyze this spending data and provide 3-5 specific, actionable recommendations:

Spending Summary:
- Total Expenses: $${data.totalExpenses.toFixed(2)}
- This Month: $${data.monthlyExpenses.toFixed(2)}

Category Breakdown:
${data.categoryBreakdown.map(cat => 
  `- ${cat.category}: $${cat.amount.toFixed(2)} (${cat.percentage.toFixed(1)}%)`
).join('\n')}

Budget Status:
${data.budgetStatus.map(budget => 
  `- ${budget.category}: $${budget.spent.toFixed(2)} of $${budget.budget.toFixed(2)} (${budget.percentage.toFixed(1)}%)`
).join('\n')}

Provide recommendations in this JSON format:
[
  {
    "type": "savings|budget|category|trend",
    "title": "Recommendation Title",
    "description": "Detailed description of the recommendation",
    "impact": "high|medium|low",
    "actionable": true
  }
]

Focus on practical, actionable advice for improving financial health.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a personal finance advisor. Provide practical, actionable recommendations based on spending data. Always respond with valid JSON array format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    try {
      const recommendations = JSON.parse(response);
      return Array.isArray(recommendations) ? recommendations : [];
    } catch (error) {
      console.error('Failed to parse AI response:', response);
      return [];
    }
  }

  private static getFallbackRecommendations(): Recommendation[] {
    return [
      {
        type: 'savings',
        title: 'Track Your Daily Expenses',
        description: 'Start by recording every expense, no matter how small. This awareness often leads to natural spending reductions of 10-20%.',
        impact: 'high',
        actionable: true
      },
      {
        type: 'budget',
        title: 'Follow the 50/30/20 Rule',
        description: 'Allocate 50% of income to needs, 30% to wants, and 20% to savings and debt repayment for balanced financial health.',
        impact: 'high',
        actionable: true
      },
      {
        type: 'category',
        title: 'Review Subscription Services',
        description: 'Audit your monthly subscriptions and cancel any you don\'t actively use. This can save $50-200+ per month.',
        impact: 'medium',
        actionable: true
      },
      {
        type: 'trend',
        title: 'Set Up Automatic Savings',
        description: 'Automate your savings by setting up automatic transfers to a separate savings account on payday.',
        impact: 'high',
        actionable: true
      },
      {
        type: 'savings',
        title: 'Build an Emergency Fund',
        description: 'Aim to save 3-6 months of expenses in an emergency fund to avoid debt during unexpected situations.',
        impact: 'high',
        actionable: true
      }
    ];
  }

  private static parseTextRecommendations(text: string): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      // Try to parse different formats
      const match1 = line.match(/(\d+)\.\s*\[?(.+?)\]?\s*-\s*(.+?)\s*\(Impact:\s*(High|Medium|Low)\)/i);
      const match2 = line.match(/(\d+)\.\s*(.+?):\s*(.+?)\s*\(Impact:\s*(High|Medium|Low)\)/i);
      
      if (match1) {
        const [, , title, description, impact] = match1;
        recommendations.push({
          type: 'savings',
          title: title.trim(),
          description: description.trim(),
          impact: impact.toLowerCase() as 'high' | 'medium' | 'low',
          actionable: true
        });
      } else if (match2) {
        const [, , title, description, impact] = match2;
        recommendations.push({
          type: 'savings',
          title: title.trim(),
          description: description.trim(),
          impact: impact.toLowerCase() as 'high' | 'medium' | 'low',
          actionable: true
        });
      }
    });
    
    return recommendations;
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
