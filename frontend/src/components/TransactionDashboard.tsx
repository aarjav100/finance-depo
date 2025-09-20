import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Edit, 
  Trash2, 
  Copy, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar as CalendarIcon,
  Tag,
  Repeat,
  Globe,
  PieChart,
  BarChart3,
  LineChart,
  MoreHorizontal,
  Eye,
  EyeOff,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  Wallet,
  Banknote,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  description: string;
  category: string;
  tags: string[];
  paymentMethod: string;
  date: Date;
  isRecurring: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'yearly';
  recurringEndDate?: Date;
  isPaid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'cash' | 'card' | 'bank' | 'digital';
  icon: string;
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Rate to USD
}

const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.85 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.73 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 110.0 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.25 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.35 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', rate: 0.92 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 6.45 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 74.0 },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', rate: 5.2 }
];

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'cash', name: 'Cash', type: 'cash', icon: 'Banknote' },
  { id: 'debit', name: 'Debit Card', type: 'card', icon: 'CreditCard' },
  { id: 'credit', name: 'Credit Card', type: 'card', icon: 'CreditCard' },
  { id: 'bank', name: 'Bank Transfer', type: 'bank', icon: 'Wallet' },
  { id: 'digital', name: 'Digital Wallet', type: 'digital', icon: 'Wallet' }
];

const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Salary', type: 'income', icon: 'DollarSign', color: 'green', isDefault: true },
  { id: 'freelance', name: 'Freelance', type: 'income', icon: 'DollarSign', color: 'green', isDefault: true },
  { id: 'investment', name: 'Investment', type: 'income', icon: 'TrendingUp', color: 'green', isDefault: true },
  { id: 'bonus', name: 'Bonus', type: 'income', icon: 'Star', color: 'green', isDefault: true },
  { id: 'other', name: 'Other Income', type: 'income', icon: 'DollarSign', color: 'gray', isDefault: true }
];

const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Dining', type: 'expense', icon: 'DollarSign', color: 'red', isDefault: true },
  { id: 'transport', name: 'Transportation', type: 'expense', icon: 'DollarSign', color: 'blue', isDefault: true },
  { id: 'housing', name: 'Housing', type: 'expense', icon: 'DollarSign', color: 'purple', isDefault: true },
  { id: 'entertainment', name: 'Entertainment', type: 'expense', icon: 'DollarSign', color: 'pink', isDefault: true },
  { id: 'healthcare', name: 'Healthcare', type: 'expense', icon: 'DollarSign', color: 'red', isDefault: true },
  { id: 'shopping', name: 'Shopping', type: 'expense', icon: 'DollarSign', color: 'orange', isDefault: true },
  { id: 'bills', name: 'Bills & Utilities', type: 'expense', icon: 'DollarSign', color: 'yellow', isDefault: true },
  { id: 'other', name: 'Other Expenses', type: 'expense', icon: 'DollarSign', color: 'gray', isDefault: true }
];

export function TransactionDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const { user } = useAuth();
  const { toast } = useToast();

  // Mock data for demonstration
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      type: 'expense',
      amount: 25.50,
      currency: 'USD',
      description: 'Coffee at Starbucks',
      category: 'food',
      tags: ['coffee', 'morning'],
      paymentMethod: 'debit',
      date: new Date('2024-01-15'),
      isRecurring: false,
      isPaid: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      type: 'income',
      amount: 3000.00,
      currency: 'USD',
      description: 'Monthly Salary',
      category: 'salary',
      tags: ['work', 'monthly'],
      paymentMethod: 'bank',
      date: new Date('2024-01-01'),
      isRecurring: true,
      recurringFrequency: 'monthly',
      isPaid: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: '3',
      type: 'expense',
      amount: 120.00,
      currency: 'USD',
      description: 'Grocery Shopping',
      category: 'food',
      tags: ['groceries', 'weekly'],
      paymentMethod: 'credit',
      date: new Date('2024-01-14'),
      isRecurring: false,
      isPaid: true,
      createdAt: new Date('2024-01-14'),
      updatedAt: new Date('2024-01-14')
    }
  ];

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      // Mock API call - in real app, this would fetch from backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTransactions(mockTransactions);
      setFilteredTransactions(mockTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Filter transactions based on search and filters
  useEffect(() => {
    let filtered = transactions;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === selectedType);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(transaction => transaction.category === selectedCategory);
    }

    // Date range filter
    if (dateRange.from) {
      filtered = filtered.filter(transaction => transaction.date >= dateRange.from!);
    }
    if (dateRange.to) {
      filtered = filtered.filter(transaction => transaction.date <= dateRange.to!);
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchQuery, selectedType, selectedCategory, dateRange]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netAmount = totalIncome - totalExpenses;
    
    const categoryBreakdown = filteredTransactions.reduce((acc, transaction) => {
      const category = transaction.category;
      if (!acc[category]) {
        acc[category] = { amount: 0, count: 0 };
      }
      acc[category].amount += transaction.amount;
      acc[category].count += 1;
      return acc;
    }, {} as Record<string, { amount: number; count: number }>);

    return {
      totalIncome,
      totalExpenses,
      netAmount,
      transactionCount: filteredTransactions.length,
      categoryBreakdown
    };
  }, [filteredTransactions]);

  const handleAddTransaction = (transactionData: Partial<Transaction>) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: transactionData.type || 'expense',
      amount: transactionData.amount || 0,
      currency: transactionData.currency || 'USD',
      description: transactionData.description || '',
      category: transactionData.category || 'other',
      tags: transactionData.tags || [],
      paymentMethod: transactionData.paymentMethod || 'cash',
      date: transactionData.date || new Date(),
      isRecurring: transactionData.isRecurring || false,
      recurringFrequency: transactionData.recurringFrequency,
      recurringEndDate: transactionData.recurringEndDate,
      isPaid: transactionData.isPaid || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setShowAddDialog(false);
    toast({
      title: "Success",
      description: "Transaction added successfully"
    });
  };

  const handleEditTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev =>
      prev.map(transaction =>
        transaction.id === id
          ? { ...transaction, ...updates, updatedAt: new Date() }
          : transaction
      )
    );
    setEditingTransaction(null);
    toast({
      title: "Success",
      description: "Transaction updated successfully"
    });
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
    toast({
      title: "Success",
      description: "Transaction deleted successfully"
    });
  };

  const handleDuplicateTransaction = (transaction: Transaction) => {
    const duplicatedTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTransactions(prev => [duplicatedTransaction, ...prev]);
    toast({
      title: "Success",
      description: "Transaction duplicated successfully"
    });
  };

  const togglePaidStatus = (id: string) => {
    setTransactions(prev =>
      prev.map(transaction =>
        transaction.id === id
          ? { ...transaction, isPaid: !transaction.isPaid, updatedAt: new Date() }
          : transaction
      )
    );
  };

  const getCategoryInfo = (categoryId: string) => {
    const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
    return allCategories.find(cat => cat.id === categoryId) || allCategories[0];
  };

  const getPaymentMethodInfo = (methodId: string) => {
    return PAYMENT_METHODS.find(method => method.id === methodId) || PAYMENT_METHODS[0];
  };

  const getCurrencyInfo = (currencyCode: string) => {
    return CURRENCIES.find(curr => curr.code === currencyCode) || CURRENCIES[0];
  };

  const formatAmount = (amount: number, currency: string) => {
    const currencyInfo = getCurrencyInfo(currency);
    return `${currencyInfo.symbol}${amount.toFixed(2)}`;
  };

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user, loadTransactions]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Transaction Dashboard</h2>
            <p className="text-muted-foreground">Manage your income and expenses</p>
          </div>
        </div>
        <div className="flex items-center justify-center p-16">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mb-4 mx-auto">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
            <p className="text-foreground font-medium">Loading transactions...</p>
            <p className="text-muted-foreground text-sm mt-2">Fetching your financial data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Transaction Dashboard</h2>
          <p className="text-muted-foreground">Manage your income and expenses with ease</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadTransactions} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
                <DialogDescription>
                  Enter the details for your new transaction
                </DialogDescription>
              </DialogHeader>
              <TransactionForm
                onSubmit={handleAddTransaction}
                onCancel={() => setShowAddDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatAmount(summaryStats.totalIncome, selectedCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.transactionCount} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatAmount(summaryStats.totalExpenses, selectedCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.transactionCount} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Net Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summaryStats.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatAmount(summaryStats.netAmount, selectedCurrency)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.netAmount >= 0 ? 'Surplus' : 'Deficit'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryStats.transactionCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Total entries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {[...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(currency => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? format(dateRange.from, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Transactions</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No transactions found</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery || selectedType !== 'all' || selectedCategory !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Add your first transaction to get started'
                }
              </p>
            </div>
          ) : (
            <div className={cn(
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
                : 'space-y-2'
            )}>
              {filteredTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={setEditingTransaction}
                  onDelete={handleDeleteTransaction}
                  onDuplicate={handleDuplicateTransaction}
                  onTogglePaid={togglePaidStatus}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Transaction Dialog */}
      {editingTransaction && (
        <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
              <DialogDescription>
                Update the details for this transaction
              </DialogDescription>
            </DialogHeader>
            <TransactionForm
              transaction={editingTransaction}
              onSubmit={(updates) => handleEditTransaction(editingTransaction.id, updates)}
              onCancel={() => setEditingTransaction(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Transaction Form Component
function TransactionForm({ 
  transaction, 
  onSubmit, 
  onCancel 
}: { 
  transaction?: Transaction | null; 
  onSubmit: (data: Partial<Transaction>) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    type: transaction?.type || 'expense',
    amount: transaction?.amount || 0,
    currency: transaction?.currency || 'USD',
    description: transaction?.description || '',
    category: transaction?.category || 'other',
    tags: transaction?.tags || [],
    paymentMethod: transaction?.paymentMethod || 'cash',
    date: transaction?.date || new Date(),
    isRecurring: transaction?.isRecurring || false,
    recurringFrequency: transaction?.recurringFrequency || 'monthly',
    isPaid: transaction?.isPaid || false
  });

  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map(currency => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <Select value={formData.paymentMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map(method => (
                <SelectItem key={method.id} value={method.id}>
                  {method.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(formData.date, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.date}
                onSelect={(date) => setFormData(prev => ({ ...prev, date: date || new Date() }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag} size="sm">
              Add
            </Button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="recurring"
            checked={formData.isRecurring}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRecurring: checked }))}
          />
          <Label htmlFor="recurring">Recurring Transaction</Label>
        </div>

        {formData.isRecurring && (
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={formData.recurringFrequency} onValueChange={(value: any) => setFormData(prev => ({ ...prev, recurringFrequency: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Switch
            id="paid"
            checked={formData.isPaid}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPaid: checked }))}
          />
          <Label htmlFor="paid">Mark as Paid</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {transaction ? 'Update' : 'Add'} Transaction
        </Button>
      </div>
    </form>
  );
}

// Transaction Card Component
function TransactionCard({ 
  transaction, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onTogglePaid, 
  viewMode 
}: { 
  transaction: Transaction; 
  onEdit: (transaction: Transaction) => void; 
  onDelete: (id: string) => void; 
  onDuplicate: (transaction: Transaction) => void; 
  onTogglePaid: (id: string) => void; 
  viewMode: 'list' | 'grid';
}) {
  const getCategoryInfo = (categoryId: string) => {
    const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
    return allCategories.find(cat => cat.id === categoryId) || allCategories[0];
  };

  const getPaymentMethodInfo = (methodId: string) => {
    return PAYMENT_METHODS.find(method => method.id === methodId) || PAYMENT_METHODS[0];
  };

  const getCurrencyInfo = (currencyCode: string) => {
    return CURRENCIES.find(curr => curr.code === currencyCode) || CURRENCIES[0];
  };

  const formatAmount = (amount: number, currency: string) => {
    const currencyInfo = getCurrencyInfo(currency);
    return `${currencyInfo.symbol}${amount.toFixed(2)}`;
  };

  const categoryInfo = getCategoryInfo(transaction.category);
  const paymentMethodInfo = getPaymentMethodInfo(transaction.paymentMethod);
  const currencyInfo = getCurrencyInfo(transaction.currency);

  return (
    <Card className={cn(
      "group hover:shadow-md transition-all duration-200",
      viewMode === 'list' ? "flex items-center justify-between p-4" : "p-4"
    )}>
      <div className={cn(viewMode === 'list' ? "flex-1" : "space-y-3")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              transaction.type === 'income' 
                ? "bg-green-100 text-green-600" 
                : "bg-red-100 text-red-600"
            )}>
              {transaction.type === 'income' ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
            </div>
            <div>
              <h4 className="font-medium">{transaction.description}</h4>
              <p className="text-sm text-muted-foreground">{categoryInfo.name}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={cn(
              "font-bold",
              transaction.type === 'income' ? "text-green-600" : "text-red-600"
            )}>
              {formatAmount(transaction.amount, transaction.currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(transaction.date, "MMM dd, yyyy")}
            </p>
          </div>
        </div>

        {viewMode === 'grid' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{paymentMethodInfo.name}</span>
              {transaction.isRecurring && (
                <Badge variant="outline" className="text-xs">
                  <Repeat className="w-3 h-3 mr-1" />
                  {transaction.recurringFrequency}
                </Badge>
              )}
            </div>

            {transaction.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {transaction.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onTogglePaid(transaction.id)}
                  className="p-1 h-6"
                >
                  {transaction.isPaid ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-600" />
                  )}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {transaction.isPaid ? 'Paid' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={cn(
        "flex items-center gap-1",
        viewMode === 'list' ? "ml-4" : "mt-3"
      )}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(transaction)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDuplicate(transaction)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Copy className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(transaction.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
