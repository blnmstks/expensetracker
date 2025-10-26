import { useState, useMemo, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar as CalendarIcon, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from './ui/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { Category, Expense, CurrencySettings } from '../App';
import { AVAILABLE_CURRENCIES } from '../App';
import { useCategories } from '../store/categories';

interface AnalyticsProps {
  expenses: Expense[];
  currencySettings: CurrencySettings;
}

export function Analytics({ expenses, currencySettings }: AnalyticsProps) {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'all' | 'custom'>('month');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [startCalendarOpen, setStartCalendarOpen] = useState(false);
  const [endCalendarOpen, setEndCalendarOpen] = useState(false);
  const { categories, fetchCategories } = useCategories();
    
    useEffect(() => {
      fetchCategories();
    }, []);

  const convertToDefaultCurrency = (amount: number, fromCurrency: string) => {
    if (fromCurrency === currencySettings.defaultCurrency) {
      return amount;
    }
    
    const fromRate = currencySettings.exchangeRates[fromCurrency] || 1;
    const toRate = currencySettings.exchangeRates[currencySettings.defaultCurrency] || 1;
    
    const inUSD = amount / fromRate;
    return inUSD * toRate;
  };

  const getCurrencySymbol = (code: string) => {
    return AVAILABLE_CURRENCIES.find(c => c.code === code)?.symbol || code;
  };

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      
      if (dateRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return expenseDate >= weekAgo;
      } else if (dateRange === 'month') {
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        return expenseDate >= monthStart && expenseDate <= monthEnd;
      } else if (dateRange === 'custom' && startDate && endDate) {
        return expenseDate >= startDate && expenseDate <= endDate;
      }
      
      return true;
    });
  }, [expenses, dateRange, startDate, endDate]);

  const categoryData = useMemo(() => {
    const categoryTotals = new Map<string, number>();
    
    filteredExpenses.forEach(expense => {
      const expCurrency = expense.currency || currencySettings.defaultCurrency;
      const convertedAmount = convertToDefaultCurrency(expense.amount, expCurrency);
      const current = categoryTotals.get(expense.category) || 0;
      categoryTotals.set(expense.category, current + convertedAmount);
    });

    return Array.from(categoryTotals.entries()).map(([categoryId, amount]) => {
      const category = categories.find(cat => cat.id === categoryId);
      return {
        name: category?.name || 'Неизвестно',
        value: amount,
        color: category?.color || '#94a3b8',
        icon: category?.icon || '📦',
      };
    }).sort((a, b) => b.value - a.value);
  }, [filteredExpenses, categories, currencySettings]);

  const monthlyData = useMemo(() => {
    const monthTotals = new Map<string, number>();
    
    expenses.forEach(expense => {
      const month = format(new Date(expense.date), 'MMM yyyy', { locale: ru });
      const expCurrency = expense.currency || currencySettings.defaultCurrency;
      const convertedAmount = convertToDefaultCurrency(expense.amount, expCurrency);
      const current = monthTotals.get(month) || 0;
      monthTotals.set(month, current + convertedAmount);
    });

    return Array.from(monthTotals.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(-6);
  }, [expenses, currencySettings]);

  const totalAmount = filteredExpenses.reduce((sum, exp) => {
    const expCurrency = exp.currency || currencySettings.defaultCurrency;
    return sum + convertToDefaultCurrency(exp.amount, expCurrency);
  }, 0);
  const averageExpense = filteredExpenses.length > 0 
    ? totalAmount / filteredExpenses.length 
    : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-neutral-900 mb-4">Аналитика расходов</h2>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Период" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Последние 7 дней</SelectItem>
                  <SelectItem value="month">Текущий месяц</SelectItem>
                  <SelectItem value="all">Всё время</SelectItem>
                  <SelectItem value="custom">Выбрать период</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === 'custom' && (
              <>
                <Popover open={startCalendarOpen} onOpenChange={setStartCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'flex-1 justify-start',
                        !startDate && 'text-neutral-500'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'dd MMM yyyy', { locale: ru }) : 'От'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        setStartCalendarOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover open={endCalendarOpen} onOpenChange={setEndCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'flex-1 justify-start',
                        !endDate && 'text-neutral-500'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'dd MMM yyyy', { locale: ru }) : 'До'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date);
                        setEndCalendarOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-neutral-500 mb-1">Всего расходов</div>
                <div className="text-emerald-600">{totalAmount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {getCurrencySymbol(currencySettings.defaultCurrency)}</div>
              </div>
              <TrendingDown className="w-8 h-8 text-emerald-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-neutral-500 mb-1">Количество</div>
            <div className="text-emerald-600">{filteredExpenses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-neutral-500 mb-1">Средний расход</div>
            <div className="text-emerald-600">{averageExpense.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {getCurrencySymbol(currencySettings.defaultCurrency)}</div>
          </CardContent>
        </Card>
      </div>

      {categoryData.length > 0 ? (
        <>
          {/* Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Расходы по категориям</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `${value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${getCurrencySymbol(currencySettings.defaultCurrency)}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Детализация</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((cat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: cat.color + '20' }}
                        >
                          <span>{cat.icon}</span>
                        </div>
                        <div>
                          <div className="text-neutral-900">{cat.name}</div>
                          <div className="text-neutral-500 text-sm">
                            {((cat.value / totalAmount) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="text-neutral-900">
                        {cat.value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {getCurrencySymbol(currencySettings.defaultCurrency)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trend */}
          {monthlyData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Тренд по месяцам</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => `${value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${getCurrencySymbol(currencySettings.defaultCurrency)}`}
                    />
                    <Bar dataKey="amount" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-neutral-500">
            Нет данных для отображения. Добавьте расходы, чтобы увидеть аналитику.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
