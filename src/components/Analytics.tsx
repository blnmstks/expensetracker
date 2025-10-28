import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { CurrencySettings } from '../App';
import { AVAILABLE_CURRENCIES } from '../App';
import { useCategories, useExpenses } from '../store/categories';
import { Select, Card, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import styles from './Analytics.module.css';

interface AnalyticsProps {
  currencySettings: CurrencySettings;
}

type DataType = {
  key: string;
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  [monthKey: string]: number | string;
};

const capitalize = (value: string) => {
  if (!value) {
    return '';
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export function Analytics({ currencySettings }: AnalyticsProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<number>(currencySettings.defaultCurrency);
  const { categories, fetchCategories } = useCategories();
  const { expenses, fetchExpenses } = useExpenses();

  useEffect(() => {
    fetchCategories();
    fetchExpenses();
  }, [fetchCategories, fetchExpenses]);

  const convertCurrency = (
    amount: number,
    fromCurrencyId: number,
    toCurrencyId: number,
  ) => {
    if (fromCurrencyId === toCurrencyId) {
      return amount;
    }

    const fromCurrency = AVAILABLE_CURRENCIES.find((c) => c.id === fromCurrencyId);
    const toCurrency = AVAILABLE_CURRENCIES.find((c) => c.id === toCurrencyId);

    if (!fromCurrency || !toCurrency) {
      return amount;
    }

    const fromRate = currencySettings.exchangeRates[fromCurrency.code] || 1;
    const toRate = currencySettings.exchangeRates[toCurrency.code] || 1;

    const inUsd = amount / fromRate;
    return inUsd * toRate;
  };

  const getCurrencySymbol = (currencyId: number) => {
    return AVAILABLE_CURRENCIES.find((c) => c.id === currencyId)?.symbol || '';
  };

  const lastMonthRange = useMemo(() => {
    const current = new Date();
    const lastMonthEnd = new Date(current.getFullYear(), current.getMonth(), 0);
    const lastMonthStart = new Date(
      lastMonthEnd.getFullYear(),
      lastMonthEnd.getMonth(),
      1,
    );
    const key = `${lastMonthStart.getFullYear()}-${String(
      lastMonthStart.getMonth() + 1,
    ).padStart(2, '0')}`;

    const label = capitalize(
      format(lastMonthStart, 'LLLL yyyy', { locale: ru }),
    );

    return {
      start: lastMonthStart,
      end: lastMonthEnd,
      display: label,
      key,
    };
  }, []);

  const lastMonthExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate >= lastMonthRange.start && expenseDate <= lastMonthRange.end
      );
    });
  }, [expenses, lastMonthRange]);

  const aggregatedByCategory = useMemo(() => {
    const map = new Map<number, number>();

    lastMonthExpenses.forEach((expense) => {
      const amount = convertCurrency(
        expense.amount,
        expense.currency,
        selectedCurrency,
      );

      map.set(expense.category, (map.get(expense.category) || 0) + amount);
    });

    return map;
  }, [lastMonthExpenses, selectedCurrency, currencySettings]);

  const currencySymbol = getCurrencySymbol(selectedCurrency);

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const months = useMemo(() => [lastMonthRange], [lastMonthRange]);

  const columns = useMemo<ColumnsType<DataType>>(() => {
    const baseColumn: ColumnsType<DataType> = [
      {
        title: 'Категория',
        dataIndex: 'categoryName',
        key: 'category',
        fixed: 'left',
        width: 200,
        render: (_, record) => (
          <span className={styles.categoryCell}>
            <span className={styles.categoryIcon}>{record.categoryIcon}</span>
            {record.categoryName}
          </span>
        ),
      },
    ];

    const monthColumns: ColumnsType<DataType> = months.map((month) => ({
      title: month.display,
      dataIndex: `month-${month.key}`,
      key: `month-${month.key}`,
      align: 'right',
      render: (value?: number) => {
        if (!value || value <= 0) {
          return <span className={styles.muted}>—</span>;
        }

        return `${formatAmount(value)} ${currencySymbol}`;
      },
    }));

    return baseColumn.concat(monthColumns);
  }, [months, currencySymbol]);

  const dataSource = useMemo<DataType[]>(() => {
    return categories.map((category) => ({
      key: String(category.id),
      categoryId: category.id,
      categoryName: category.name,
      categoryIcon: category.icon,
      [`month-${lastMonthRange.key}`]:
        aggregatedByCategory.get(category.id) || 0,
    }));
  }, [aggregatedByCategory, categories, lastMonthRange.key]);

  return (
    <div className="max-w-full mx-auto space-y-6 md:p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
          Аналитика расходов
        </h2>

        <div className="w-full sm:w-48">
          <Select
            value={selectedCurrency}
            onChange={setSelectedCurrency}
            options={AVAILABLE_CURRENCIES.map((currency) => ({
              value: currency.id,
              label: `${currency.symbol} ${currency.code}`,
            }))}
            size="large"
          />
        </div>
      </div>

      <Card>
        <Table<DataType>
          className={styles.customTable}
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          scroll={{ x: 'max-content', y: 55 * 5 }}
        />
        {lastMonthExpenses.length === 0 && (
          <div className="mt-4 text-sm text-neutral-500 text-center">
            Нет данных за последний месяц. Добавьте расходы, чтобы увидеть аналитику.
          </div>
        )}
      </Card>
    </div>
  );
}
