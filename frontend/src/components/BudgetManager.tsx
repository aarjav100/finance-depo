import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, AlertTriangle, Target, TrendingDown, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import CategoryService, { Category } from '@/services/categoryService';

const budgetSchema = z.object({
  amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Amount must be a positive number'),
  categoryId: z.string().min(1, 'Category is required'),
  period: z.enum(['weekly', 'monthly', 'yearly'])
});

type BudgetData = z.infer<typeof budgetSchema>;

interface Budget {
  id: string;
  amount: number;
  period: string;
  start_date: string;
  is_active: boolean;
  expense_categories: {
    name: string;
    icon: string;
    color: string;
  } | null;
  spent: number;
}


interface BudgetManagerProps {
  onBudgetChanged: () => void;
}

export function BudgetManager({ onBudgetChanged }: BudgetManagerProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<BudgetData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      amount: '',
      categoryId: '',
      period: 'monthly'
    }
  });

  useEffect(() => {
    if (user) {
      loadBudgets();
      loadCategories();
    }
  }, [user]);

  const loadBudgets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3002/api/budgets', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch budgets');
      }

      const result = await response.json();
      const budgetData = result.data.budgets || [];

      // Calculate spent amounts for each budget
      const budgetsWithSpent = await Promise.all(
        budgetData.map(async (budget: any) => {
          const startDate = new Date(budget.startDate);
          const endDate = getEndDateForPeriod(startDate, budget.period);
          
          // Get expenses for this budget period
          const expensesResponse = await fetch(`http://localhost:3002/api/expenses?categoryId=${budget.categoryId}&startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          let spent = 0;
          if (expensesResponse.ok) {
            const expensesResult = await expensesResponse.json();
            spent = expensesResult.data.expenses?.reduce((sum: number, expense: any) => sum + Number(expense.amount), 0) || 0;
          }

          return {
            id: budget.id,
            amount: budget.amount,
            period: budget.period,
            start_date: budget.startDate,
            is_active: budget.isActive,
            category_id: budget.categoryId,
            expense_categories: budget.category,
            spent
          };
        })
      );

      setBudgets(budgetsWithSpent);
    } catch (error) {
      console.error('Error loading budgets:', error);
      toast({
        title: "Error",
        description: "Failed to load budgets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categories = await CategoryService.getCategories();
      setCategories(categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const getEndDateForPeriod = (startDate: Date, period: string): Date => {
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
  };

  const handleSubmit = async (data: BudgetData) => {
    try {
      console.log('Form data received:', data);
      console.log('Form errors:', form.formState.errors);
      
      const token = localStorage.getItem('token');
      
      const requestBody = {
        amount: parseFloat(data.amount),
        categoryId: data.categoryId,
        period: data.period,
        startDate: new Date().toISOString()
      };
      
      console.log('Sending budget request:', requestBody);
      
      const response = await fetch('http://localhost:3002/api/budgets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Budget creation error:', errorData);
        
        // Show detailed validation errors if available
        if (errorData.details && Array.isArray(errorData.details)) {
          const errorMessages = errorData.details.map((detail: any) => detail.message).join(', ');
          throw new Error(`Validation failed: ${errorMessages}`);
        }
        
        throw new Error(errorData.error || 'Failed to create budget');
      }

      toast({
        title: "Success",
        description: "Budget created successfully"
      });

      form.reset();
      setIsDialogOpen(false);
      loadBudgets();
      onBudgetChanged();
    } catch (error: any) {
      console.error('Error adding budget:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create budget",
        variant: "destructive"
      });
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3002/api/budgets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete budget');
      }

      toast({
        title: "Success",
        description: "Budget deleted successfully"
      });

      loadBudgets();
      onBudgetChanged();
    } catch (error: any) {
      console.error('Error deleting budget:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete budget",
        variant: "destructive"
      });
    }
  };

  const getBudgetStatus = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return { 
      label: 'Over Budget', 
      variant: 'destructive' as const, 
      icon: TrendingUp,
      color: 'text-red-500' 
    };
    if (percentage >= 90) return { 
      label: 'Near Limit', 
      variant: 'secondary' as const, 
      icon: AlertTriangle,
      color: 'text-orange-500' 
    };
    return { 
      label: 'On Track', 
      variant: 'default' as const, 
      icon: TrendingDown,
      color: 'text-green-500' 
    };
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-gradient-to-r from-red-500 to-red-600';
    if (percentage >= 90) return 'bg-gradient-to-r from-orange-500 to-orange-600';
    if (percentage >= 75) return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
    return 'bg-gradient-to-r from-green-500 to-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 animate-fade-in">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mb-4 mx-auto animate-pulse-glow">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
          <p className="text-muted-foreground">Loading budgets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Budget Manager
            </h2>
          </div>
          <p className="text-muted-foreground">Set and track your spending limits with intelligent monitoring</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="group bg-gradient-primary hover:shadow-glow transition-all duration-300 hover:scale-105">
              <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Create Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gradient-card border-0 shadow-floating animate-scale-in">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Target className="w-5 h-5 text-primary" />
                Create New Budget
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <Label className="text-sm font-medium">Category</Label>
                <Controller
                  name="categoryId"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="mt-2 transition-all duration-300 focus:shadow-glow">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{category.icon}</span>
                              <span>{category.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.categoryId && (
                  <p className="text-sm text-destructive mt-2 animate-fade-in">
                    {form.formState.errors.categoryId.message}
                  </p>
                )}
              </div>

              <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <Label htmlFor="amount" className="text-sm font-medium">Budget Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  {...form.register('amount')}
                  placeholder="0.00"
                  className="mt-2 transition-all duration-300 focus:shadow-glow"
                />
                {form.formState.errors.amount && (
                  <p className="text-sm text-destructive mt-2 animate-fade-in">
                    {form.formState.errors.amount.message}
                  </p>
                )}
              </div>

              <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Period
                </Label>
                <Controller
                  name="period"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="mt-2 transition-all duration-300 focus:shadow-glow">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="flex gap-3 pt-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-primary hover:shadow-glow transition-all duration-300" 
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create Budget'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="hover:scale-105 transition-all duration-300"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Enhanced Budgets List */}
      <div className="grid gap-6">
        {budgets.length === 0 ? (
          <Card className="border-0 shadow-card bg-gradient-card animate-fade-in-up">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No budgets created yet</h3>
              <p className="text-muted-foreground mb-6">Create your first budget to start tracking spending!</p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Budget
              </Button>
            </CardContent>
          </Card>
        ) : (
          budgets.map((budget, index) => {
            const budgetAmount = budget.amount;
            const percentage = Math.min((budget.spent / budgetAmount) * 100, 100);
            const status = getBudgetStatus(budget.spent, budgetAmount);
            const StatusIcon = status.icon;
            
            return (
              <Card 
                key={budget.id} 
                className="group border-0 shadow-card bg-gradient-card hover:shadow-floating transition-all duration-700 hover:-translate-y-2 animate-slide-up overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 from-primary to-accent"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 group-hover:opacity-15 transition-opacity duration-500 from-primary to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                
                <CardHeader className="pb-4 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 animate-breathe">
                        <span className="text-3xl">{budget.expense_categories?.icon || '💰'}</span>
                      </div>
                      <div>
                        <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">
                          {budget.expense_categories?.name || 'Other'}
                        </CardTitle>
                        <CardDescription className="capitalize text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3" />
                          {budget.period} Budget
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={status.variant} 
                        className={`flex items-center gap-1 ${status.color} group-hover:scale-110 transition-transform duration-300`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBudget(budget.id)}
                        className="text-destructive hover:text-destructive hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6 relative">
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">Spent</span>
                      <span className="font-semibold text-foreground">
                        ${budget.spent.toFixed(2)} of ${budgetAmount.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="relative">
                        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-full ${getProgressColor(percentage)} rounded-full transition-all duration-1000 ease-out animate-breathe`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-xs">
                        <span className={`font-medium ${status.color} group-hover:scale-105 transition-transform`}>
                          {percentage.toFixed(1)}% used
                        </span>
                        <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                          ${(budgetAmount - budget.spent).toFixed(2)} remaining
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {percentage >= 90 && (
                    <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
                      percentage >= 100 
                        ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400' 
                        : 'bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400'
                    } animate-fade-in group-hover:scale-105 transition-transform duration-300`}>
                      <AlertTriangle className="w-4 h-4 animate-wiggle" />
                      <span className="font-medium">
                        {percentage >= 100 
                          ? 'Budget exceeded! Consider reducing expenses in this category.'
                          : 'Near budget limit. Monitor your spending closely.'
                        }
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}