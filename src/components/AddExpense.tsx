import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  Card, 
  Input, 
  Button, 
  Select, 
  DatePicker, 
  message, 
  Typography, 
  Space,
} from 'antd';
import { 
  CalendarOutlined, 
  DeleteOutlined
} from '@ant-design/icons';
import { useCategoryIconResolver } from '../hooks/useCategoryIconResolver';
import { useCategories, useCurrency } from '../store';
import dayjs, { Dayjs } from 'dayjs';
import { Currency, Expense } from '../types';
import type { SelectProps } from 'antd';

const { TextArea } = Input;
const { Text } = Typography;

interface AddExpenseProps {
  onAddExpense: (expense: Omit<Expense, 'id' | 'month' | 'year' | 'category_color' | 'category_name' | 'category_icon' | 'currency_code' | 'currency_symbol' | 'created_at'>) => void;
  expenses: Expense[];
  onDeleteExpense: (id: number) => void;
}

export function AddExpense({ onAddExpense, expenses, onDeleteExpense }: AddExpenseProps) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency | null>(null);
  const [category, setCategory] = useState<number | null>(null);
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [comment, setComment] = useState('');
  const { categories, fetchCategories, fetchCategoryIcons } = useCategories();
  const { 
    currency: fetchedCurrencies, 
    fetchCurrency,
    defaultCurrency,
    fetchDefaultCurrency,
  } = useCurrency();
  const { resolveCategoryIcon } = useCategoryIconResolver();

  // const hasMoreCurrencies = currencySettings.activeCurrencies.length > 3;

  useEffect(() => {
    fetchCategories();
    fetchCurrency();
    fetchDefaultCurrency();
    fetchCategoryIcons();
  }, []);

  useEffect(() => {
    if (!fetchedCurrencies.length) {
      return;
    }

    setCurrency((prev) => {
      if (prev && fetchedCurrencies.some((curr) => curr.id === prev.id)) {
        return prev;
      }

      const defaultCurr =
        fetchedCurrencies.find((curr) => curr.id === defaultCurrency) ||
        fetchedCurrencies.find((curr) => curr.is_default) ||
        fetchedCurrencies.find((curr) => curr.is_active) ||
        fetchedCurrencies[0];

      return defaultCurr ?? prev;
    });
  }, [defaultCurrency, fetchedCurrencies]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount) {
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return;
    }

    const categoryId = category ?? categories[0]?.id;
    if (!categoryId) {
      message.error('Выберите категорию');
      return;
    }

    if (!currency) {
      message.error('Выберите валюту');
      return;
    }

    onAddExpense({
      amount: numAmount,
      currency: currency.id,
      category: categoryId,
      date: date.format('YYYY-MM-DD'),
      comment: comment.trim() || undefined,
    });
    message.success(`Вы потратили ${numAmount.toFixed(2)} ${currency?.symbol}`);

    setAmount('');
    setCategory(categoryId);
    setComment('');
    fetchCategories();
  };

  const getCategoryById = (id: number) => {
    return categories.find(cat => cat.id === id);
  };

  useEffect(() => {
    if (categories.length > 0) {
      setCategory((prev) => {
        if (prev !== null && categories.some((cat) => cat.id === prev)) {
          return prev;
        }
        return categories[0].id;
      });
    }
  }, [categories]);

  const categoryOptions = useMemo<SelectProps<number>['options']>(() => {
    return categories.map((cat) => {
      const iconSymbol = resolveCategoryIcon(cat) || '📦';

      return {
        value: cat.id,
        label: (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>{iconSymbol}</span>
            <span style={{ flex: 1, minWidth: 0 }}>{cat.name}</span>
          </span>
        ),
        searchLabel: `${cat.name}`.toLowerCase(),
      };
    });
  }, [categories, resolveCategoryIcon]);

  return (
    <div style={{ maxWidth: '768px', margin: '0 auto' }}>
      <Card title="Добавить расход" style={{ marginBottom: '24px' }}>
        <form onSubmit={handleSubmit}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Text style={{ display: 'block', marginBottom: '8px' }}>Сумма</Text>
              <div style={{ display: 'flex', alignItems: 'stretch', gap: '8px', width: '100%' }}>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ fontSize: '16px', flex: 1 }}
                  size="large"
                />
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {fetchedCurrencies
                  .filter((curr) => curr.is_active)
                  .map((curr) => (
                    <Button
                      key={curr.id}
                      type={currency?.id === curr.id ? 'primary' : 'default'}
                      onClick={() => setCurrency(curr)}
                      size="large"
                      style={{
                        minWidth: '48px',
                        ...(currency?.id === curr.id
                          ? { backgroundColor: '#2078F3', borderColor: '#2078F3' }
                          : {}),
                      }}
                    >
                      {curr.symbol}
                    </Button>
                  ))}
                  {/* {hasMoreCurrencies && (
                    <Dropdown
                      menu={{
                        items: fetchedCurrencies.map((curr) => ({
                          key: curr,
                          // label: `${getCurrencySymbol(curr)} ${AVAILABLE_CURRENCIES.find(c => c.id === curr)?.code}`,
                          // onClick: () => setCurrency(curr),
                        })),
                      }}
                    >
                      <Button
                        icon={<MoreOutlined />}
                        size="large"
                        style={{ minWidth: '48px', backgroundColor: '#f5f5f5' }}
                      />
                    </Dropdown>
                  )} */}
                </div>
              </div>
            </div>

            <div>
              <Text style={{ display: 'block', marginBottom: '8px' }}>Категория</Text>
              <Select<number>
                showSearch
                size="large"
                placeholder="Выберите категорию"
                value={category ?? undefined}
                onChange={(value) => setCategory(value)}
                style={{ width: '100%' }}
                options={categoryOptions}
                filterOption={(input, option) => {
                  const normalizedInput = input.trim().toLowerCase();
                  if (!normalizedInput) {
                    return true;
                  }
                  const searchSource = (option?.searchLabel as string | undefined) ?? '';
                  return searchSource.includes(normalizedInput);
                }}
                filterSort={(optionA, optionB) =>
                  ((optionA?.searchLabel as string | undefined) || '').localeCompare(
                    (optionB?.searchLabel as string | undefined) || ''
                  )
                }
              />
            </div>

            <div>
              <Text style={{ display: 'block', marginBottom: '8px' }}>Месяц (опционально)</Text>
              <DatePicker
                value={date}
                onChange={(newDate) => newDate && setDate(newDate)}
                format="MMMM YYYY"
                picker="month"
                style={{ width: '100%' }}
                size="large"
                placeholder="Выберите месяц"
                suffixIcon={<CalendarOutlined />}
              />
            </div>

            <div>
              <Text style={{ display: 'block', marginBottom: '8px' }}>Комментарий (опционально)</Text>
              <TextArea
                placeholder="Добавьте заметку о расходе..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                size="large"
              />
            </div>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              style={{ backgroundColor: '#2078F3', borderColor: '#2078F3' }}
            >
              Добавить расход
            </Button>
          </Space>
        </form>
      </Card>

      {/* Summary Card */}
      <Card style={{ marginBottom: '24px' }}>
        <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>Расходы за месяц</Text>
        {/* TODO: Add month totals by currency */}
      </Card>

      {/* Recent Expenses */}
      {expenses.length > 0 && (
        <Card title="Последние расходы">
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {expenses.slice(0, 10).map((expense) => {
              const cat = getCategoryById(expense.category);
              const iconSymbol = resolveCategoryIcon(cat) || '📦';
              return (
                <div
                  key={expense.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '12px',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                >
                  <Space style={{ flex: 1 }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: cat?.color + '20',
                        flexShrink: 0
                      }}
                    >
                      <span>{iconSymbol}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500 }}>{cat?.name}</div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {format(new Date(expense.date), 'LLLL yyyy', { locale: ru })}
                      </Text>
                      {expense.comment && (
                        <div style={{ fontSize: '12px', color: '#bfbfbf', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {expense.comment ?? ''}
                        </div>
                      )}
                    </div>
                    <div style={{ marginRight: '8px', fontWeight: 500 }}>
                      {/* {expense.amount.toLocaleString('ru-RU')} {getCurrencySymbol(expCurrency)} */}
                    </div>
                    <Button
                      type="text"
                      icon={<DeleteOutlined style={{ fontSize: 18, color: '#8c8c8c' }} />}
                      onClick={() => onDeleteExpense(expense.id)}
                    />
                  </Space>
                </div>
              );
            })}
          </Space>
        </Card>
      )}
    </div>
  );
}
