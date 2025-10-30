import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { AVAILABLE_CURRENCIES } from '../App';
import { useCurrency, useExpenses } from '../store';
import { Select, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CurrencySettings } from '../types';

interface AnalyticsProps {
  currencySettings: CurrencySettings;
}

type DataType = {
  key: string;
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

const MONTHS = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
];

const monthKeyToDate = (key: string) => {
  const [rawMonth, rawYear] = key.toLowerCase().split('-');

  if (!rawMonth || !rawYear) {
    return null;
  }

  const monthIndex = MONTHS.indexOf(rawMonth);

  if (monthIndex === -1) {
    return null;
  }

  const yearValue = Number(rawYear);

  if (Number.isNaN(yearValue)) {
    return null;
  }

  const fullYear = rawYear.length === 2 ? 2000 + yearValue : yearValue;

  return new Date(fullYear, monthIndex, 1);
};

const getMonthLabel = (key: string) => {
  const date = monthKeyToDate(key);

  if (!date) {
    return key;
  }

  return capitalize(format(date, 'LLLL yyyy', { locale: ru }));
};

export function Analytics({ currencySettings }: AnalyticsProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<number>(currencySettings.defaultCurrency);
  const { categoryMonthlyExpenses, fetchCategoryMonthlyExpenses } = useExpenses();
  const { currency: currencies, fetchCurrency } = useCurrency(); // необходимо получить список валют из стора

  useEffect(() => {
    fetchCategoryMonthlyExpenses();
    fetchCurrency();
  }, [fetchCategoryMonthlyExpenses]);

  const convertCurrency = (amount: number, fromCurrencyId: number, toCurrencyId: number) => {
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

  const currencySymbol = getCurrencySymbol(selectedCurrency);

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const categoryRows = useMemo(() => {
    if (!categoryMonthlyExpenses || typeof categoryMonthlyExpenses !== 'object') {
      return [];
    }

    return Object.entries(categoryMonthlyExpenses).map(([categoryName, payload]) => {
      const { icon, values } = (payload as { icon?: string; values?: Record<string, number> }) || {};

      return {
        categoryName,
        categoryIcon: icon ?? '',
        values: values ?? {},
      };
    });
  }, [categoryMonthlyExpenses]);

  const monthKeys = useMemo(() => {
    const keys = new Set<string>();

    categoryRows.forEach(({ values }) => {
      Object.keys(values).forEach((monthKey) => keys.add(monthKey));
    });

    return Array.from(keys).sort((a, b) => {
      const dateA = monthKeyToDate(a);
      const dateB = monthKeyToDate(b);

      if (!dateA && !dateB) {
        return b.localeCompare(a);
      }

      if (!dateA) {
        return 1;
      }

      if (!dateB) {
        return -1;
      }

      return dateB.getTime() - dateA.getTime();
    });
  }, [categoryRows]);

  const columns = useMemo<ColumnsType<DataType>>(() => {
    const baseColumn: ColumnsType<DataType> = [
      {
        title: 'Категория',
        dataIndex: 'categoryName',
        key: 'category',
        fixed: 'left',
        width: 200,
        render: (_, record) => (
          <span>
            <span>{record.categoryIcon}</span>
            {record.categoryName}
          </span>
        ),
      },
    ];

    const monthColumns: ColumnsType<DataType> = monthKeys.map((monthKey) => ({
      title: getMonthLabel(monthKey),
      dataIndex: `month-${monthKey}`,
      key: `month-${monthKey}`,
      align: 'right',
      render: (value?: number) => {
        if (!value || value <= 0) {
          return <span>—</span>;
        }

        return `${formatAmount(value)} ${currencySymbol}`;
      },
    }));

    return baseColumn.concat(monthColumns);
  }, [monthKeys, currencySymbol]);

  const dataSource = useMemo<DataType[]>(() => {
    return categoryRows.map(({ categoryName, categoryIcon, values }) => {
      const monthValues = monthKeys.reduce<Record<string, number>>((acc, monthKey) => {
        const rawValue = values?.[monthKey] ?? 0;
        const convertedValue = convertCurrency(
          Number(rawValue),
          currencySettings.defaultCurrency,
          selectedCurrency,
        );

        acc[`month-${monthKey}`] = convertedValue;
        return acc;
      }, {});

      return {
        key: categoryName,
        categoryName,
        categoryIcon,
        ...monthValues,
      };
    });
  }, [categoryRows, monthKeys, currencySettings, selectedCurrency]);

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

      <Table<DataType>
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        scroll={{ x: 'max-content', y: 55 * 5 }}
      />
      {dataSource.length === 0 && (
        <div className="mt-4 text-sm text-neutral-500 text-center">
          Нет данных для отображения. Добавьте расходы, чтобы увидеть аналитику.
        </div>
      )}
    </div>
  );
}
