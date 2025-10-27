import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import type { CurrencySettings } from '../App';
import { AVAILABLE_CURRENCIES } from '../App';
import { useCategories, useExpenses } from '../store/categories';

interface AnalyticsProps {
  currencySettings: CurrencySettings;
}

interface MonthYearKey {
  month: number;
  year: number;
  key: string;
  display: string;
}


export function Analytics({ currencySettings }: AnalyticsProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<number>(currencySettings.defaultCurrency);
  const { categories, fetchCategories } = useCategories();
  const { expenses, fetchExpenses } = useExpenses();

  useEffect(() => {
    fetchCategories();
    fetchExpenses();
  }, []);

  // Функция конвертации валют
  const convertCurrency = (amount: number, fromCurrencyId: number, toCurrencyId: number) => {
    if (fromCurrencyId === toCurrencyId) {
      return amount;
    }
    
    const fromCurrency = AVAILABLE_CURRENCIES.find(c => c.id === fromCurrencyId);
    const toCurrency = AVAILABLE_CURRENCIES.find(c => c.id === toCurrencyId);
    
    if (!fromCurrency || !toCurrency) return amount;
    
    const fromRate = currencySettings.exchangeRates[fromCurrency.code] || 1;
    const toRate = currencySettings.exchangeRates[toCurrency.code] || 1;
    
    const inUSD = amount / fromRate;
    return inUSD * toRate;
  };

  // Получаем символ валюты
  const getCurrencySymbol = (currencyId: number) => {
    return AVAILABLE_CURRENCIES.find(c => c.id === currencyId)?.symbol || '';
  };

  // Получаем уникальные месяцы из расходов (от нового к старому)
  const monthYearColumns = useMemo((): MonthYearKey[] => {
    const monthsSet = new Set<string>();
    
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const month = date.getMonth() + 1; // 1-12
      const year = date.getFullYear();
      const key = `${year}-${String(month).padStart(2, '0')}`;
      monthsSet.add(key);
    });
    
    const monthsArray = Array.from(monthsSet).map(key => {
      const [year, month] = key.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return {
        month: parseInt(month),
        year: parseInt(year),
        key,
        display: format(date, 'MMM yyyy', { locale: ru })
      };
    });
    
    // Сортируем от нового к старому
    return monthsArray.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }, [expenses]);

  // Подсчет расходов по категориям и месяцам
  const tableData = useMemo(() => {
    const data = new Map<number, Map<string, number>>();
    
    // Инициализируем данные для каждой категории
    categories.forEach(category => {
      data.set(category.id, new Map());
    });
    
    // Заполняем данные
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const key = `${year}-${String(month).padStart(2, '0')}`;
      
      const categoryId = expense.category;
      const convertedAmount = convertCurrency(expense.amount, expense.currency, selectedCurrency);
      
      if (data.has(categoryId)) {
        const categoryData = data.get(categoryId)!;
        const currentAmount = categoryData.get(key) || 0;
        categoryData.set(key, currentAmount + convertedAmount);
      }
    });
    
    // Подсчитываем итоги по строкам (категориям)
    const rowTotals = new Map<number, number>();
    data.forEach((monthData, categoryId) => {
      let total = 0;
      monthData.forEach(amount => {
        total += amount;
      });
      rowTotals.set(categoryId, total);
    });
    
    // Подсчитываем итоги по колонкам (месяцам)
    const columnTotals = new Map<string, number>();
    monthYearColumns.forEach(month => {
      let total = 0;
      data.forEach(categoryData => {
        total += categoryData.get(month.key) || 0;
      });
      columnTotals.set(month.key, total);
    });
    
    // Общий итог
    let grandTotal = 0;
    rowTotals.forEach(total => {
      grandTotal += total;
    });
    
    return { data, rowTotals, columnTotals, grandTotal };
  }, [expenses, categories, monthYearColumns, selectedCurrency]);

  // Сортируем категории по убыванию суммы
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const totalA = tableData.rowTotals.get(a.id) || 0;
      const totalB = tableData.rowTotals.get(b.id) || 0;
      console.log('tabelData.rowTotals', tableData.rowTotals.get(a.id));
      return totalB - totalA;
    });
  }, [categories, tableData.rowTotals]);

  // Форматирование числа
  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ru-RU', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  return (
    <div className="max-w-full mx-auto space-y-6 md:p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">Аналитика расходов</h2>
        
        <div className="w-full sm:w-48">
          <Select 
            value={String(selectedCurrency)} 
            onValueChange={(value) => setSelectedCurrency(Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите валюту" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_CURRENCIES.map(currency => (
                <SelectItem key={currency.id} value={String(currency.id)}>
                  {currency.symbol} {currency.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {expenses.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Расходы по категориям и месяцам</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold min-w-[200px] sticky left-0 bg-white z-10">
                      Категория
                    </TableHead>
                    {monthYearColumns.map(month => (
                      <TableHead key={month.key} className="text-right font-bold min-w-[120px]">
                        {month.display}
                      </TableHead>
                    ))}
                    <TableHead className="text-right font-bold min-w-[120px] bg-neutral-50">
                      Итого
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCategories.map(category => {
                    const categoryMonthData = tableData.data.get(category.id);
                    const rowTotal = tableData.rowTotals.get(category.id) || 0;
                    
                    // Пропускаем категории без расходов
                    // if (rowTotal === 0) return null;
                    
                    return (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium sticky left-0 bg-white z-10">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: category.color + '20' }}
                            >
                              <span>{category.icon}</span>
                            </div>
                            <span>{category.name}</span>
                          </div>
                        </TableCell>
                        {monthYearColumns.map(month => {
                          const amount = categoryMonthData?.get(month.key) || 0;
                          return (
                            <TableCell key={month.key} className="text-right">
                              {amount > 0 ? (
                                <span className="text-neutral-900">
                                  {formatAmount(amount)}
                                </span>
                              ) : (
                                <span className="text-neutral-400">—</span>
                              )}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-right font-semibold bg-neutral-50">
                          {formatAmount(rowTotal)} {getCurrencySymbol(selectedCurrency)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  {/* Строка итогов */}
                  <TableRow className="bg-emerald-50 font-bold">
                    <TableCell className="sticky left-0 bg-emerald-50 z-10">
                      Итого
                    </TableCell>
                    {monthYearColumns.map(month => {
                      const total = tableData.columnTotals.get(month.key) || 0;
                      return (
                        <TableCell key={month.key} className="text-right">
                          {formatAmount(total)}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-right bg-emerald-100">
                      {formatAmount(tableData.grandTotal)} {getCurrencySymbol(selectedCurrency)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
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
