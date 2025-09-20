import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Edit, Calendar, DollarSign, Receipt } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import CategoryService, { Category } from '@/services/categoryService';

const expenseSchema = z.object({
  amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Amount must be a positive number'),
  description: z.string().min(1, 'Description is required'),
  category_id: z.string().min(1, 'Category is required'),
  expense_date: z.string().min(1, 'Date is required')
});

type ExpenseData = z.infer<typeof expenseSchema>;

interface Expense {
  id: string;
  amount: number;
  description: string;
  expense_date: string;
  expense_categories: {
    name: string;
    icon: string;
    color: string;
  } | null;
}


interface ExpenseTrackerProps {
  onExpenseAdded: () => void;
}

export function ExpenseTracker({ onExpenseAdded }: ExpenseTrackerProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<ExpenseData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: '',
      description: '',
      category_id: '',
      expense_date: new Date().toISOString().split('T')[0]
    }
  });

  useEffect(() => {
    if (user) {
      loadExpenses();
      loadCategories();
    }
  }, [user]);

  const loadExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3002/api/expenses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }

      const result = await response.json();
      setExpenses(result.data.expenses || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
      toast({
        title: "Error",
        description: "Failed to load expenses",
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

  const handleSubmit = async (data: ExpenseData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3002/api/expenses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(data.amount),
          description: data.description,
          categoryId: data.category_id,
          expenseDate: data.expense_date
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add expense');
      }

      toast({
        title: "Success",
        description: "Expense added successfully"
      });

      form.reset({
        amount: '',
        description: '',
        category_id: '',
        expense_date: new Date().toISOString().split('T')[0]
      });
      
      setIsDialogOpen(false);
      loadExpenses();
      onExpenseAdded();
    } catch (error: any) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add expense",
        variant: "destructive"
      });
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3002/api/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete expense');
      }

      toast({
        title: "Success",
        description: "Expense deleted successfully"
      });

      loadExpenses();
      onExpenseAdded();
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete expense",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 animate-fade-in">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mb-4 mx-auto animate-pulse-glow">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
          <p className="text-muted-foreground">Loading expenses...</p>
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Expense Tracker
            </h2>
          </div>
          <p className="text-muted-foreground">Track and manage your daily expenses with smart categorization</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="group bg-gradient-primary hover:shadow-glow transition-all duration-300 hover:scale-105">
              <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gradient-card border-0 shadow-floating animate-scale-in">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <DollarSign className="w-5 h-5 text-primary" />
                Add New Expense
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <Label htmlFor="amount" className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Amount ($)
                </Label>
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

              <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Input
                  id="description"
                  {...form.register('description')}
                  placeholder="What did you spend on?"
                  className="mt-2 transition-all duration-300 focus:shadow-glow"
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive mt-2 animate-fade-in">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <Label className="text-sm font-medium">Category</Label>
                <Select onValueChange={(value) => form.setValue('category_id', value)}>
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
                {form.formState.errors.category_id && (
                  <p className="text-sm text-destructive mt-2 animate-fade-in">
                    {form.formState.errors.category_id.message}
                  </p>
                )}
              </div>

              <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <Label htmlFor="expense_date" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date
                </Label>
                <Input
                  id="expense_date"
                  type="date"
                  {...form.register('expense_date')}
                  className="mt-2 transition-all duration-300 focus:shadow-glow"
                />
                {form.formState.errors.expense_date && (
                  <p className="text-sm text-destructive mt-2 animate-fade-in">
                    {form.formState.errors.expense_date.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-primary hover:shadow-glow transition-all duration-300" 
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Adding...
                    </div>
                  ) : (
                    'Add Expense'
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

      {/* Enhanced Expenses List */}
      <div className="space-y-4">
        {expenses.length === 0 ? (
          <Card className="border-0 shadow-card bg-gradient-card animate-fade-in-up">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                <Receipt className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No expenses recorded yet</h3>
              <p className="text-muted-foreground mb-6">Add your first expense to start tracking your spending!</p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Expense
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {expenses.map((expense, index) => (
              <Card 
                key={expense.id} 
                className="group border-0 shadow-card bg-gradient-card hover:shadow-floating transition-all duration-500 hover:-translate-y-1 animate-slide-up cursor-pointer overflow-hidden"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="py-6 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 animate-breathe">
                          <span className="text-2xl">{expense.expense_categories?.icon || '💰'}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-lg">
                            {expense.description}
                          </h3>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge 
                              variant="secondary" 
                              className="bg-primary/10 text-primary border-primary/20 group-hover:scale-105 transition-transform duration-300"
                            >
                              {expense.expense_categories?.name || 'Other'}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(expense.expense_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                        ${expense.amount.toFixed(2)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteExpense(expense.id)}
                        className="text-destructive hover:text-destructive hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}