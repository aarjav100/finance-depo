import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { ExpenseTracker } from '@/components/ExpenseTracker';
import { BudgetManager } from '@/components/BudgetManager';
import { Analytics } from '@/components/Analytics';
import { AIRecommendations } from '@/components/AIRecommendations';
import { DollarSign, TrendingUp, PieChart, Target, LogOut, Sparkles, BarChart3, Brain } from 'lucide-react';

interface DashboardStats {
  totalExpenses: number;
  monthlyExpenses: number;
  categoriesCount: number;
  budgetsCount: number;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalExpenses: 0,
    monthlyExpenses: 0,
    categoriesCount: 0,
    budgetsCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadStats();
  }, [user, navigate]);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Get analytics data from backend
      const response = await fetch('http://localhost:3002/api/analytics/overview', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const result = await response.json();
      const analytics = result.data;

      setStats({
        totalExpenses: analytics.totalExpenses || 0,
        monthlyExpenses: analytics.monthlyExpenses || 0,
        categoriesCount: analytics.categoriesCount || 0,
        budgetsCount: analytics.budgetsCount || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const refreshStats = () => {
    loadStats();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mb-6 mx-auto animate-pulse-glow">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <p className="text-foreground font-medium text-lg">Loading your dashboard...</p>
          <p className="text-muted-foreground text-sm mt-2">Analyzing your financial data</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Expenses",
      value: `$${stats.totalExpenses.toFixed(2)}`,
      icon: DollarSign,
      gradient: "from-blue-500 to-cyan-500",
      description: "All-time expenses"
    },
    {
      title: "This Month",
      value: `$${stats.monthlyExpenses.toFixed(2)}`,
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-500",
      description: "Current month spending"
    },
    {
      title: "Categories",
      value: stats.categoriesCount.toString(),
      icon: PieChart,
      gradient: "from-purple-500 to-violet-500",
      description: "Expense categories"
    },
    {
      title: "Active Budgets",
      value: stats.budgetsCount.toString(),
      icon: Target,
      gradient: "from-orange-500 to-red-500",
      description: "Budget tracking"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Enhanced Header */}
      <header className="relative bg-gradient-card backdrop-blur-lg border-b border-border/50 shadow-floating">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5"></div>
        <div className="container mx-auto px-4 py-6 relative">
          <div className="flex justify-between items-center">
            <div className="animate-fade-in-left">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center animate-pulse-glow">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Finance Manager
                </h1>
              </div>
              <p className="text-muted-foreground flex items-center gap-2">
                <span>Welcome back,</span>
                <span className="font-medium text-foreground">{user?.email}</span>
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="group hover:scale-105 transition-all duration-300 hover:shadow-glow animate-fade-in-right"
            >
              <LogOut className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat, index) => (
            <Card 
              key={stat.title}
              className="group relative overflow-hidden border-0 shadow-card bg-gradient-card hover:shadow-floating transition-all duration-700 hover:-translate-y-2 animate-scale-in cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 from-primary to-accent"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-500 from-primary to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              
              <CardHeader className="pb-2 relative">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {stat.title}
                  </CardTitle>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-glow animate-breathe`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative">
                <div className="text-3xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Main Content */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <Tabs defaultValue="expenses" className="space-y-8">
            <div className="relative">
              <TabsList className="grid w-full grid-cols-4 bg-gradient-card border border-border/50 p-1 rounded-xl shadow-soft">
                {[
                  { value: "expenses", label: "Expenses", icon: DollarSign },
                  { value: "budgets", label: "Budgets", icon: Target },
                  { value: "analytics", label: "Analytics", icon: BarChart3 },
                  { value: "ai", label: "AI Insights", icon: Brain }
                ].map((tab, index) => (
                  <TabsTrigger 
                    key={tab.value}
                    value={tab.value}
                    className="relative flex items-center gap-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-glow transition-all duration-300 hover:scale-105 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="relative">
              <TabsContent value="expenses" className="animate-fade-in-up">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 rounded-2xl opacity-0 animate-fade-in" style={{ animationDelay: '0.2s' }}></div>
                  <ExpenseTracker onExpenseAdded={refreshStats} />
                </div>
              </TabsContent>

              <TabsContent value="budgets" className="animate-fade-in-up">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-green-500/10 via-transparent to-blue-500/10 rounded-2xl opacity-0 animate-fade-in" style={{ animationDelay: '0.2s' }}></div>
                  <BudgetManager onBudgetChanged={refreshStats} />
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="animate-fade-in-up">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 rounded-2xl opacity-0 animate-fade-in" style={{ animationDelay: '0.2s' }}></div>
                  <Analytics />
                </div>
              </TabsContent>

              <TabsContent value="ai" className="animate-fade-in-up">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/10 via-transparent to-red-500/10 rounded-2xl opacity-0 animate-fade-in" style={{ animationDelay: '0.2s' }}></div>
                  <AIRecommendations />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;