import { useState, useMemo, useEffect, useCallback } from 'react';
import { useCurrency, useExpenses } from '../store';
import { Select, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

type DataType = {
  key: string;
  categoryName: string;
  categoryIcon: string;
  [monthKey: string]: number | string;
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

export function Analytics() {
  const { categoryMonthlyExpenses, fetchCategoryMonthlyExpenses } = useExpenses();
  const { currency: currencies, fetchCurrency } = useCurrency();
  
  useEffect(() => {
    fetchCategoryMonthlyExpenses();
    fetchCurrency();
  }, [fetchCategoryMonthlyExpenses, fetchCurrency]);

  const defaultCurrency = useMemo(
    () => currencies.find((currency) => currency.is_default) ?? currencies[0],
    [currencies],
  );

  const [selectedCurrency, setSelectedCurrency] = useState<number | null>(null);

  useEffect(() => {
    if (defaultCurrency && selectedCurrency === null) {
      setSelectedCurrency(defaultCurrency.id);
    }
  }, [defaultCurrency, selectedCurrency]);

  const getCurrencyRate = useCallback(
    (currencyId?: number) => {
      if (!currencyId) return 1;

      const rawRate = currencies.find((currency) => currency.id === currencyId)?.rate;
      const parsedRate = rawRate ? parseFloat(rawRate) : NaN;

      return Number.isFinite(parsedRate) && parsedRate > 0 ? parsedRate : 1;
    },
    [currencies],
  );

  const convertCurrency = useCallback(
    (amount: number, fromCurrencyId?: number, toCurrencyId?: number) => {
      if (!fromCurrencyId || !toCurrencyId || fromCurrencyId === toCurrencyId) {
        return amount;
      }

      const fromRate = getCurrencyRate(fromCurrencyId);
      const toRate = getCurrencyRate(toCurrencyId);

      if (!fromRate || !toRate) {
        return amount;
      }

      const amountInBase = amount / fromRate;
      return amountInBase * toRate;
    },
    [getCurrencyRate],
  );

  const getCurrencySymbol = (currencyId?: number) => {
    if (!currencyId) return '';
    return currencies.find((currency) => currency.id === currencyId)?.symbol || '';
  };

  const currencySymbol = getCurrencySymbol(selectedCurrency ?? defaultCurrency?.id);

  const formatAmount = (amount: number) => {
    if (!Number.isFinite(amount)) {
      return amount;
    }
    return amount.toLocaleString('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).replace(',', '.');
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
            {record.categoryIcon} {record.categoryName} 
          </span>
        ),
      },
    ];

    const monthColumns: ColumnsType<DataType> = monthKeys.map((monthKey) => ({
      title: monthKey,
      dataIndex: `month-${monthKey}`,
      key: `month-${monthKey}`,
      align: 'center',
      render: (value?: number) => {
        if (!value || value <= 0) {
          return <span> </span>;
        }

        const formatted = formatAmount(value);
        return currencySymbol ? `${formatted} ${currencySymbol}` : formatted;
      },
    }));

    return baseColumn.concat(monthColumns);
  }, [monthKeys, currencySymbol]);

  const dataSource = useMemo<DataType[]>(() => {
    const baseCurrencyId = defaultCurrency?.id;
    const targetCurrencyId = selectedCurrency ?? baseCurrencyId;

    return categoryRows.map(({ categoryName, categoryIcon, values }) => {
      const monthValues = monthKeys.reduce<Record<string, number>>((acc, monthKey) => {
        const rawValue = Number(values?.[monthKey] ?? 0);

        if (!baseCurrencyId || !targetCurrencyId) {
          acc[`month-${monthKey}`] = rawValue;
          return acc;
        }

        acc[`month-${monthKey}`] = convertCurrency(
          rawValue,
          baseCurrencyId,
          targetCurrencyId,
        );

        return acc;
      }, {});

      return {
        key: categoryName,
        categoryName,
        categoryIcon,
        ...monthValues,
      };
    });
  }, [categoryRows, monthKeys, convertCurrency, defaultCurrency, selectedCurrency]);

  return (
    <div className="max-w-full mx-auto space-y-6 md:p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
          Аналитика расходов
        </h2>

        <div className="w-full sm:w-48">
          <Select
            value={selectedCurrency ?? defaultCurrency?.id}
            onChange={setSelectedCurrency}
            options={currencies
              .filter((currency) => currency.is_active)
              .map((currency) => ({
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
        bordered
      />
      {dataSource.length === 0 && (
        <div className="mt-4 text-sm text-neutral-500 text-center">
          Нет данных для отображения. Добавьте расходы, чтобы увидеть аналитику.
        </div>
      )}
    </div>
  );
}
