import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { Expense, CurrencySettings } from '../App';
import { AVAILABLE_CURRENCIES } from '../App';
import { useEffect } from 'react';
import { useCategories, useExpenses } from '../store/categories';

interface HistoryProps {
  currencySettings: CurrencySettings;
}

export function History({ currencySettings }: HistoryProps) {
  const { categories, fetchCategories } = useCategories();
  const { expenses, fetchExpenses } = useExpenses();

  useEffect(() => {
    fetchCategories();
    fetchExpenses();
  }, []);

  const getCategoryById = (id: number) => {
    return categories.find(cat => cat.id === id);
  };

  const getCurrencySymbol = (code: string) => {
    return AVAILABLE_CURRENCIES.find(c => c.code === code)?.symbol || code;
  };

  const convertToDefaultCurrency = (amount: number, fromCurrency: string) => {
    if (fromCurrency === currencySettings.defaultCurrency) {
      return amount;
    }
    
    const fromRate = currencySettings.exchangeRates[fromCurrency] || 1;
    const toRate = currencySettings.exchangeRates[currencySettings.defaultCurrency] || 1;
    
    // Convert to USD first (base), then to target currency
    const inUSD = amount / fromRate;
    return inUSD * toRate;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-neutral-900 mb-4">История расходов</h2>
      </div>

      {expenses.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Все операции</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenses.map((expense) => {
                const cat = getCategoryById(expense.category);
                const expenseCurrency = expense.currency || currencySettings.defaultCurrency;
                const convertedAmount = convertToDefaultCurrency(expense.amount, expenseCurrency);
                
                return (
                  <div
                    key={expense.id}
                    className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
                  >
                    {/* Icon and Category */}
                    <div className="flex items-center gap-3 md:w-48">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: cat?.color + '20' }}
                      >
                        <span className="text-xl">{cat?.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-neutral-900">{cat?.name}</div>
                        <div className="text-neutral-500 text-sm">
                          {format(new Date(expense.date), 'dd.MM.yyyy HH:mm', { locale: ru })}
                        </div>
                      </div>
                    </div>

                    {/* Amount in Original Currency */}
                    <div className="md:w-32">
                      <div className="text-neutral-500 text-sm mb-1">Сумма</div>
                      <div className="text-neutral-900">
                        {expense.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {getCurrencySymbol(expenseCurrency)}
                      </div>
                    </div>

                    {/* Amount in Default Currency */}
                    {expenseCurrency !== currencySettings.defaultCurrency && (
                      <div className="md:w-32">
                        <div className="text-neutral-500 text-sm mb-1">В {currencySettings.defaultCurrency}</div>
                        <div className="text-neutral-600">
                          {convertedAmount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {getCurrencySymbol(currencySettings.defaultCurrency)}
                        </div>
                      </div>
                    )}

                    {/* Comment */}
                    <div className="flex-1 min-w-0">
                      {expense.comment ? (
                        <>
                          <div className="text-neutral-500 text-sm mb-1">Комментарий</div>
                          <div className="text-neutral-700 text-sm">{expense.comment}</div>
                        </>
                      ) : (
                        <div className="text-neutral-400 text-sm italic">Без комментария</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-neutral-500">
            История расходов пуста. Добавьте расходы, чтобы увидеть их здесь.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
