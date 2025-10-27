import { useEffect, useState } from 'react';
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
  Dropdown,
} from 'antd';
import { 
  CalendarOutlined, 
  DeleteOutlined, 
  DollarOutlined, 
  MoreOutlined 
} from '@ant-design/icons';
import type { Expense, CurrencySettings } from '../App';
import { AVAILABLE_CURRENCIES } from '../App';
import { useCategories } from '../store/categories';
import dayjs, { Dayjs } from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

interface AddExpenseProps {
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  expenses: Expense[];
  onDeleteExpense: (id: number) => void;
  currencySettings: CurrencySettings;
}

export function AddExpense({ onAddExpense, expenses, onDeleteExpense, currencySettings }: AddExpenseProps) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(currencySettings.defaultCurrency);
  const [category, setCategory] = useState(1);
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [comment, setComment] = useState('');
  const { categories, fetchCategories } = useCategories();
  
  // Get quick access currencies (first 3 active currencies)
  const quickCurrencies = currencySettings.activeCurrencies.slice(0, 3);
  const hasMoreCurrencies = currencySettings.activeCurrencies.length > 3;

  const getCurrencySymbol = (code: number) => {
    return AVAILABLE_CURRENCIES.find(c => c.id === code)?.symbol || code;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount) {
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return;
    }

    const selectedCategory = getCategoryById(category);
    const selectedCurrency = AVAILABLE_CURRENCIES.find(c => c.id === currency);

    onAddExpense({
      amount: numAmount,
      currency,
      category,
      date: date.format('YYYY-MM-DD'),
      month: parseInt(date.format('YYYYMM')),
      year: parseInt(date.format('YYYY')),
      comment: comment.trim() || undefined,
      category_color: selectedCategory?.color || '#10b981',
      category_name: selectedCategory?.name || '',
      category_icon: selectedCategory?.icon || '📦',
      currency_code: selectedCurrency?.code || 'USD',
      currency_symbol: currency,
    });
    message.success(`Вы потратили ${numAmount.toFixed(2)} ${getCurrencySymbol(currency)}`);

    setAmount('');
    setCategory(1);
    setComment('');
  };

  const getCategoryById = (id: number) => {
    return categories.find(cat => cat.id === id);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div style={{ maxWidth: '768px', margin: '0 auto' }}>
      <Card title="Добавить расход" style={{ marginBottom: '24px' }}>
        <form onSubmit={handleSubmit}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Text style={{ display: 'block', marginBottom: '8px' }}>Сумма</Text>
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ fontSize: '16px' }}
                  size="large"
                />
                <Space size={4}>
                  {quickCurrencies.map((curr) => (
                    <Button
                      key={curr}
                      type={currency === curr ? 'primary' : 'default'}
                      onClick={() => setCurrency(curr)}
                      style={currency === curr ? { backgroundColor: '#52c41a', borderColor: '#52c41a' } : {}}
                    >
                      {getCurrencySymbol(curr)}
                    </Button>
                  ))}
                  {hasMoreCurrencies && (
                    <Dropdown
                      menu={{
                        items: currencySettings.activeCurrencies.map((curr) => ({
                          key: curr,
                          label: `${getCurrencySymbol(curr)} ${AVAILABLE_CURRENCIES.find(c => c.id === curr)?.code}`,
                          onClick: () => setCurrency(curr),
                        })),
                      }}
                    >
                      <Button icon={<MoreOutlined />} />
                    </Dropdown>
                  )}
                </Space>
              </Space.Compact>
            </div>

            <div>
              <Text style={{ display: 'block', marginBottom: '8px' }}>Категория</Text>
              <Select 
                value={category} 
                onChange={setCategory}
                style={{ width: '100%' }}
                size="large"
              >
                {categories.map((cat) => (
                  <Select.Option key={cat.id} value={cat.id}>
                    <span>{cat.icon} {cat.name}</span>
                  </Select.Option>
                ))}
              </Select>
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
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
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
              const expCurrency = expense.currency || currencySettings.defaultCurrency;
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
                      <span>{cat?.icon}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500 }}>{cat?.name}</div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {format(new Date(expense.date), 'LLLL yyyy', { locale: ru })}
                      </Text>
                      {expense.comment && (
                        <div style={{ fontSize: '12px', color: '#bfbfbf', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {expense.comment}
                        </div>
                      )}
                    </div>
                    <div style={{ marginRight: '8px', fontWeight: 500 }}>
                      {expense.amount.toLocaleString('ru-RU')} {getCurrencySymbol(expCurrency)}
                    </div>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
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
