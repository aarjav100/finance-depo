import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingDown, Target, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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

  const loadSpendingData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Get analytics overview data
      const response = await fetch('http://localhost:3002/api/analytics/overview', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const result = await response.json();
      const analytics = result.data;

      // Get category breakdown
      const categoryResponse = await fetch('http://localhost:3002/api/analytics/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let categoryBreakdown = [];
      if (categoryResponse.ok) {
        const categoryResult = await categoryResponse.json();
        categoryBreakdown = categoryResult.data.categories || [];
      }

      // Get budget status
      const budgetResponse = await fetch('http://localhost:3002/api/budgets', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let budgetStatus = [];
      if (budgetResponse.ok) {
        const budgetResult = await budgetResponse.json();
        budgetStatus = (budgetResult.data.budgets || []).map((budget: any) => ({
          category: budget.category?.name || 'Other',
          budget: budget.amount,
          spent: budget.spent || 0,
          percentage: budget.spent ? (budget.spent / budget.amount) * 100 : 0
        }));
      }

      const data: SpendingData = {
        totalExpenses: Number(analytics.totalExpenses) || 0,
        monthlyExpenses: Number(analytics.monthlyExpenses) || 0,
        categoryBreakdown: categoryBreakdown.map(cat => ({
          category: cat.category || 'Unknown',
          amount: Number(cat.amount) || 0,
          percentage: Number(cat.percentage) || 0
        })),
        budgetStatus: budgetStatus.map(budget => ({
          category: budget.category || 'Unknown',
          budget: Number(budget.budget) || 0,
          spent: Number(budget.spent) || 0,
          percentage: Number(budget.percentage) || 0
        }))
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
  }, [toast]);

  useEffect(() => {
    if (user) {
      loadSpendingData();
    }
  }, [user, loadSpendingData]);

  const generateRuleBasedRecommendations = (data: SpendingData) => {
    const recs: Recommendation[] = [];

    // High spending category recommendation
    if (data.categoryBreakdown && data.categoryBreakdown.length > 0) {
      const topCategory = data.categoryBreakdown[0];
      if (topCategory && topCategory.percentage > 40) {
        recs.push({
          type: 'category',
          title: `High ${topCategory.category} Spending`,
          description: `${topCategory.category} represents ${(topCategory.percentage || 0).toFixed(1)}% of your expenses ($${(topCategory.amount || 0).toFixed(2)}). Consider reviewing these expenses for potential savings.`,
          impact: 'high',
          actionable: true
        });
      }
    }

    // Budget alerts
    if (data.budgetStatus && data.budgetStatus.length > 0) {
      data.budgetStatus.forEach(budget => {
        if (budget && budget.percentage >= 90) {
          recs.push({
            type: 'budget',
            title: `Budget Alert: ${budget.category}`,
            description: `You've spent ${(budget.percentage || 0).toFixed(1)}% of your ${budget.category} budget ($${(budget.spent || 0).toFixed(2)} of $${(budget.budget || 0).toFixed(2)}).`,
            impact: budget.percentage >= 100 ? 'high' : 'medium',
            actionable: true
          });
        }
      });
    }

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
    if (data.categoryBreakdown && data.categoryBreakdown.length > 5) {
      recs.push({
        type: 'trend',
        title: 'Spending Diversification',
        description: `You have expenses across ${data.categoryBreakdown.length} categories. Consider consolidating similar expenses or focusing on your top 3-4 spending categories for better budget control.`,
        impact: 'low',
        actionable: true
      });
    }

    // Add some general recommendations if no specific ones
    if (recs.length === 0) {
      recs.push({
        type: 'savings',
        title: 'Start Tracking Your Expenses',
        description: 'Begin by adding your daily expenses to get personalized insights and recommendations for better financial health.',
        impact: 'medium',
        actionable: true
      });
      
      recs.push({
        type: 'budget',
        title: 'Create Your First Budget',
        description: 'Set up budgets for your main spending categories to better control your finances and track your progress.',
        impact: 'high',
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
- Total Expenses: $${(spendingData.totalExpenses || 0).toFixed(2)}
- This Month: $${(spendingData.monthlyExpenses || 0).toFixed(2)}

Category Breakdown:
${(spendingData.categoryBreakdown || []).map(cat => 
  `- ${cat.category || 'Unknown'}: $${(cat.amount || 0).toFixed(2)} (${(cat.percentage || 0).toFixed(1)}%)`
).join('\n')}

Budget Status:
${(spendingData.budgetStatus || []).map(budget => 
  `- ${budget.category || 'Unknown'}: $${(budget.spent || 0).toFixed(2)} of $${(budget.budget || 0).toFixed(2)} (${(budget.percentage || 0).toFixed(1)}%)`
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
      const aiRecs = result.data.recommendations || [];
      
      // Combine rule-based and AI recommendations
      setRecommendations(prev => [...prev, ...aiRecs]);
      
      toast({
        title: "Success",
        description: aiRecs.length > 0 ? "AI recommendations generated successfully" : "Using general financial recommendations"
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">AI Insights</h2>
            <p className="text-muted-foreground">Get personalized financial recommendations</p>
          </div>
        </div>
        <div className="flex items-center justify-center p-16">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mb-4 mx-auto">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
            <p className="text-foreground font-medium">Loading insights...</p>
            <p className="text-muted-foreground text-sm mt-2">Analyzing your financial data</p>
          </div>
        </div>
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