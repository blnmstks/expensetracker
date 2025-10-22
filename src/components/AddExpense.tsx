import { useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar as CalendarIcon, Trash2, DollarSign, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Textarea } from './ui/textarea';
import { cn } from './ui/utils';
import { toast } from 'sonner@2.0.3';
import type { Category, Expense, CurrencySettings } from '../App';
import { AVAILABLE_CURRENCIES } from '../App';
import { expenseAPI } from '../services/api';

interface AddExpenseProps {
  categories: Category[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  currencySettings: CurrencySettings;
}

export function AddExpense({ categories, onAddExpense, expenses, onDeleteExpense, currencySettings }: AddExpenseProps) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(currencySettings.defaultCurrency);
  const [category, setCategory] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);

  // Get quick access currencies (first 3 active currencies)
  const quickCurrencies = currencySettings.activeCurrencies.slice(0, 3);
  const hasMoreCurrencies = currencySettings.activeCurrencies.length > 3;

  const getCurrencySymbol = (code: string) => {
    return AVAILABLE_CURRENCIES.find(c => c.code === code)?.symbol || code;
  };

  const convertToDefaultCurrency = (amount: number, fromCurrency: string) => {
    if (fromCurrency === currencySettings.defaultCurrency) {
      return amount;
    }
    
    const fromRate = currencySettings.exchangeRates[fromCurrency] || 1;
    const toRate = currencySettings.exchangeRates[currencySettings.defaultCurrency] || 1;
    
    const inUSD = amount / fromRate;
    return inUSD * toRate;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category) {
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return;
    }

    onAddExpense({
      amount: numAmount,
      currency,
      category,
      date: date.toISOString(),
      month: format(date, 'yyyy-MM'),
      comment: comment.trim() || undefined,
    });

    // Show toast notification
    const convertedAmount = convertToDefaultCurrency(numAmount, currency);
    const defaultSymbol = getCurrencySymbol(currencySettings.defaultCurrency);
    
    if (currency === currencySettings.defaultCurrency) {
      toast.success(`Вы потратили ${numAmount.toFixed(2)} ${getCurrencySymbol(currency)}`);
    } else {
      toast.success(
        `Вы потратили ${numAmount.toFixed(2)} ${getCurrencySymbol(currency)} (${convertedAmount.toFixed(2)} ${defaultSymbol})`
      );
    }

    setAmount('');
    setCategory('');
    setComment('');
  };

  const getCategoryById = (id: string) => {
    return categories.find(cat => cat.id === id);
  };

  const currentMonthExpenses = expenses.filter(exp => 
    exp.month === format(new Date(), 'yyyy-MM')
  );

  // Calculate totals for each active currency
  const monthTotalsByCurrency = currencySettings.activeCurrencies.map(currCode => {
    const total = currentMonthExpenses.reduce((sum, exp) => {
      const expCurrency = exp.currency || currencySettings.defaultCurrency;
      const convertedAmount = convertToDefaultCurrency(exp.amount, expCurrency);
      const finalAmount = convertToDefaultCurrency(convertedAmount, currencySettings.defaultCurrency);
      
      // Convert to target currency
      const targetRate = currencySettings.exchangeRates[currCode] || 1;
      const baseRate = currencySettings.exchangeRates[currencySettings.defaultCurrency] || 1;
      const inBase = finalAmount / baseRate;
      const inTarget = inBase * targetRate;
      
      return sum + inTarget;
    }, 0);

    return {
      currency: currCode,
      symbol: getCurrencySymbol(currCode),
      total,
    };
  });

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Добавить расход</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <button onClick={expenseAPI.getAll} > Button </button>
            <div className="space-y-2">
              <Label htmlFor="amount">Сумма</Label>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg text-[14px] flex-1"
                />
                <div className="flex gap-1">
                  {quickCurrencies.map((curr) => (
                    <Button
                      key={curr}
                      type="button"
                      variant="outline"
                      size="icon"
                      className={cn(
                        'w-10 h-10',
                        currency === curr && 'bg-emerald-50 border-emerald-600 text-emerald-700'
                      )}
                      onClick={() => setCurrency(curr)}
                    >
                      <span className="text-sm">{getCurrencySymbol(curr)}</span>
                    </Button>
                  ))}
                  {hasMoreCurrencies && (
                    <Popover open={currencyMenuOpen} onOpenChange={setCurrencyMenuOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="w-10 h-10"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48" align="end">
                        <div className="space-y-1">
                          {currencySettings.activeCurrencies.map((curr) => (
                            <Button
                              key={curr}
                              type="button"
                              variant="ghost"
                              className={cn(
                                'w-full justify-start',
                                currency === curr && 'bg-emerald-50 text-emerald-700'
                              )}
                              onClick={() => {
                                setCurrency(curr);
                                setCurrencyMenuOpen(false);
                              }}
                            >
                              <span className="mr-2">{getCurrencySymbol(curr)}</span>
                              {curr}
                            </Button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Категория</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center">
                        <span className="mr-2">{cat.icon}</span>
                        {cat.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Месяц (опционально)</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start',
                      !date && 'text-neutral-500'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'LLLL yyyy', { locale: ru }) : 'Выберите месяц'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                      if (newDate) {
                        setDate(newDate);
                        setCalendarOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Комментарий (опционально)</Label>
              <Textarea
                id="comment"
                placeholder="Добавьте заметку о расходе..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
              Добавить расход
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="text-neutral-500 mb-2">Расходы за месяц</div>
          <div className="space-y-1">
            {monthTotalsByCurrency.map(({ currency, symbol, total }) => (
              <div key={currency} className="text-emerald-600">
                {total.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {symbol}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      {expenses.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Последние расходы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expenses.slice(0, 10).map((expense) => {
                const cat = getCategoryById(expense.category);
                const expCurrency = expense.currency || currencySettings.defaultCurrency;
                return (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: cat?.color + '20' }}
                      >
                        <span>{cat?.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-neutral-900">{cat?.name}</div>
                        <div className="text-neutral-500 text-sm">
                          {format(new Date(expense.date), 'LLLL yyyy', { locale: ru })}
                        </div>
                        {expense.comment && (
                          <div className="text-neutral-400 text-sm mt-1 truncate">
                            {expense.comment}
                          </div>
                        )}
                      </div>
                      <div className="text-neutral-900 mr-2">
                        {expense.amount.toLocaleString('ru-RU')} {getCurrencySymbol(expCurrency)}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-neutral-400 hover:text-red-500 flex-shrink-0"
                        onClick={() => onDeleteExpense(expense.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
