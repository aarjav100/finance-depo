import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingDown, Target, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

interface Recommendation {
  type: 'savings' | 'budget' | 'category' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
}

interface SpendingData {
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

export function AIRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [spendingData, setSpendingData] = useState<SpendingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadSpendingData();
    }
  }, [user]);

  const loadSpendingData = async () => {
    setLoading(true);
    try {
      // Get all expenses
      const { data: allExpenses } = await supabase
        .from('expenses')
        .select(`
          amount,
          expense_date,
          expense_categories (name)
        `)
        .eq('user_id', user?.id);

      // Get current month expenses
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthlyExpenses = allExpenses?.filter(expense => 
        expense.expense_date.startsWith(currentMonth)
      ) || [];

      // Calculate category breakdown
      const categoryTotals = (allExpenses || []).reduce((acc: Record<string, number>, expense) => {
        const category = expense.expense_categories?.name || 'Other';
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
      const { data: budgets } = await supabase
        .from('budgets')
        .select(`
          amount,
          category_id,
          expense_categories (name)
        `)
        .eq('user_id', user?.id)
        .eq('is_active', true);

      const budgetStatus = await Promise.all(
        (budgets || []).map(async (budget) => {
          const { data: expenses } = await supabase
            .from('expenses')
            .select('amount')
            .eq('user_id', user?.id)
            .eq('category_id', budget.category_id)
            .gte('expense_date', `${currentMonth}-01`)
            .lt('expense_date', `${currentMonth}-32`);

          const spent = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
          const budgetAmount = Number(budget.amount);

          return {
            category: budget.expense_categories?.name || 'Other',
            budget: budgetAmount,
            spent,
            percentage: (spent / budgetAmount) * 100
          };
        })
      );

      const data: SpendingData = {
        totalExpenses,
        monthlyExpenses: monthlyExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0),
        categoryBreakdown,
        budgetStatus
      };

      setSpendingData(data);
      generateRuleBasedRecommendations(data);
    } catch (error) {
      console.error('Error loading spending data:', error);
      toast({
        title: "Error",
        description: "Failed to load spending data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRuleBasedRecommendations = (data: SpendingData) => {
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

    setRecommendations(recs);
  };

  const generateAIRecommendations = async () => {
    if (!spendingData) {
      toast({
        title: "Error",
        description: "No spending data available",
        variant: "destructive"
      });
      return;
    }

    setGeneratingAI(true);
    try {
      const prompt = `As a personal finance advisor, analyze this spending data and provide 3-5 specific, actionable recommendations:

Spending Summary:
- Total Expenses: $${spendingData.totalExpenses.toFixed(2)}
- This Month: $${spendingData.monthlyExpenses.toFixed(2)}

Category Breakdown:
${spendingData.categoryBreakdown.map(cat => 
  `- ${cat.category}: $${cat.amount.toFixed(2)} (${cat.percentage.toFixed(1)}%)`
).join('\n')}

Budget Status:
${spendingData.budgetStatus.map(budget => 
  `- ${budget.category}: $${budget.spent.toFixed(2)} of $${budget.budget.toFixed(2)} (${budget.percentage.toFixed(1)}%)`
).join('\n')}

Provide recommendations in this format:
1. [TITLE] - [DESCRIPTION] (Impact: High/Medium/Low)
2. [TITLE] - [DESCRIPTION] (Impact: High/Medium/Low)

Focus on practical, actionable advice for improving financial health.`;

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3002/api/ai/recommendations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI recommendations');
      }

      const result = await response.json();
      const aiText = result.data.recommendations;
      const aiRecs = parseAIRecommendations(aiText);
      
      // Combine rule-based and AI recommendations
      setRecommendations(prev => [...prev, ...aiRecs]);
      
      toast({
        title: "Success",
        description: "AI recommendations generated successfully"
      });
    } catch (error: any) {
      console.error('Error generating AI recommendations:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate AI recommendations",
        variant: "destructive"
      });
    } finally {
      setGeneratingAI(false);
    }
  };

  const parseAIRecommendations = (aiText: string): Recommendation[] => {
    const lines = aiText.split('\n').filter(line => line.trim());
    const recs: Recommendation[] = [];

    lines.forEach(line => {
      const match = line.match(/(\d+)\.\s*\[?(.+?)\]?\s*-\s*(.+?)\s*\(Impact:\s*(High|Medium|Low)\)/i);
      if (match) {
        const [, , title, description, impact] = match;
        recs.push({
          type: 'savings',
          title: title.trim(),
          description: description.trim(),
          impact: impact.toLowerCase() as 'high' | 'medium' | 'low',
          actionable: true
        });
      }
    });

    return recs;
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'savings': return <TrendingDown className="w-4 h-4" />;
      case 'budget': return <Target className="w-4 h-4" />;
      case 'category': return <AlertCircle className="w-4 h-4" />;
      case 'trend': return <Lightbulb className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AI Insights</h2>
          <p className="text-muted-foreground">Get personalized financial recommendations</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadSpendingData} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
          <Button onClick={generateAIRecommendations} disabled={generatingAI || !spendingData}>
            <Lightbulb className="w-4 h-4 mr-2" />
            {generatingAI ? 'Generating...' : 'Get AI Insights'}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {spendingData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${spendingData.monthlyExpenses.toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {spendingData.categoryBreakdown[0]?.category || 'None'}
              </div>
              <div className="text-sm text-muted-foreground">
                {spendingData.categoryBreakdown[0] ? 
                  `$${spendingData.categoryBreakdown[0].amount.toFixed(2)}` : 'No data'
                }
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Budget Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {spendingData.budgetStatus.filter(b => b.percentage >= 90).length}
              </div>
              <div className="text-sm text-muted-foreground">budgets near/over limit</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recommendations */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Recommendations</h3>
        
        {recommendations.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No recommendations available yet.</p>
              <p className="text-sm text-muted-foreground">
                Add some expenses and budgets to get personalized insights!
              </p>
            </CardContent>
          </Card>
        ) : (
          recommendations.map((rec, index) => (
            <Card key={index}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {getTypeIcon(rec.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{rec.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getImpactColor(rec.impact) as any}>
                          {rec.impact.charAt(0).toUpperCase() + rec.impact.slice(1)} Impact
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {rec.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{rec.description}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}