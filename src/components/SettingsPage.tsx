import { useEffect, useMemo, useState } from 'react';
import { 
  Card, 
  Button, 
  Input, 
  Modal, 
  Checkbox, 
  Select, 
  Typography,
  Space,
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  EditOutlined, 
} from '@ant-design/icons';
import { useCategories, useCurrency } from '../store';
import { Category } from '../types';

const { Title, Text } = Typography;

const COLOR_OPTIONS = [
  '#FF3B30', // ярко-красный
  '#FF9500', // оранжевый
  '#FFCC00', // жёлтый
  '#34C759', // зелёный
  '#007AFF', // синий
  '#5856D6', // фиолетовый
  '#5AC8FA', // голубой
  '#AF52DE', // лиловый
  '#FF2D55', // розовый
  '#8E8E93'  // серо-графитовый
];

type ManualRate = {
  id: number;
  rate: string;
};

export function SettingsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📦');
  const [newCategoryColor, setNewCategoryColor] = useState('#2078F3');
  
  const { defaultCurrency } = useCurrency();

  const { categories, fetchCategories, deleteCategory: delCategory, updateCategoryIcon, fetchCategoryIcons, categoryIcons } = useCategories();
  const { 
    currency: currencies, 
    fetchCurrency, 
    setDefaultCurrency, 
    setCurrencyActiveStatus,
    setCurrencyRates, 
  } = useCurrency();

  const [manualRates, setManualRates] = useState<ManualRate[]>([]);
  const [isSavingRates, setIsSavingRates] = useState(false);

  const activeCurrencies = useMemo(
    () => currencies.filter((currency) => currency.is_active),
    [currencies],
  );

  useEffect(() => {
    fetchCategories();
    fetchCurrency();
    fetchCategoryIcons();
  }, []);

  useEffect(() => {
    setManualRates((previous) => {
      const previousRates = new Map(previous.map((rate) => [rate.id, rate.rate]));
      const nextRates = activeCurrencies.map<ManualRate>((currency) => ({
        id: currency.id,
        rate: previousRates.get(currency.id) ?? currency.rate ?? '',
      }));

      const isSameLength = nextRates.length === previous.length;
      const isSameContent =
        isSameLength &&
        nextRates.every(
          (rate, index) =>
            rate.id === previous[index]?.id &&
            rate.rate === previous[index]?.rate,
        );

      return isSameContent ? previous : nextRates;
    });
  }, [activeCurrencies]);

  const normalizeRate = (value: string) => {
    const sanitized = value.replace(',', '.').trim();
    if (sanitized === '') {
      return '';
    }

    const parsed = Number.parseFloat(sanitized);
    if (!Number.isFinite(parsed)) {
      return '';
    }

    return parsed.toFixed(6);
  };

  const handleManualRateChange = (id: number, rawValue: string) => {
    const sanitized = rawValue.replace(',', '.');

    setManualRates((previous) => {
      const next = previous.some((rate) => rate.id === id)
        ? previous.map((rate) =>
            rate.id === id ? { ...rate, rate: sanitized } : rate,
          )
        : [...previous, { id, rate: sanitized }];

      return next;
    });
  };

  const handleSaveManualRates = async () => {
    if (!manualRates.length) {
      return;
    }

    setIsSavingRates(true);

    try {
      const ratesToPersist = manualRates
        .filter((rate) => rate.id !== defaultCurrency)
        .map((rate) => ({
          id: rate.id,
          rate: normalizeRate(rate.rate) || normalizeRate(
            currencies.find((currency) => currency.id === rate.id)?.rate ?? '',
          ),
        }))
        .filter((rate): rate is ManualRate => Boolean(rate && rate.rate));

      if (!ratesToPersist.length) {
        return;
      }

      await setCurrencyRates(ratesToPersist);

      setManualRates((previous) =>
        previous.map((rate) => {
          const updated = ratesToPersist.find((item) => item.id === rate.id);
          return updated ? updated : rate;
        }),
      );
    } finally {
      setIsSavingRates(false);
    }
  };

  const getCategoryIconSymbol = (category: Category) => {
    const iconId = Number(category.icon);

    if (!Number.isFinite(iconId)) {
      return category.icon;
    }

    const matched = categoryIcons.find((icon) => icon.id === iconId);
    return matched?.emoji ?? matched?.emojy ?? category.icon;
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;

    setNewCategoryName('');
    setNewCategoryIcon('📦');
    setNewCategoryColor('#2078F3');
    setIsAddDialogOpen(false);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryIcon(getCategoryIconSymbol(category));
    setNewCategoryColor(category.color);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !newCategoryName.trim()) return;

    setEditingCategory(null);
    setNewCategoryName('');
    setIsAddDialogOpen(false);

    updateCategoryIcon(editingCategory.id, newCategoryIcon);
  };
  
  const selectDefaultCurrency = (id: number) => {
    setDefaultCurrency(id);
  }

  const handleActiveCurrencyToggle = (id: number, is_active: boolean) => {
    setCurrencyActiveStatus(id, is_active);
  }

  const deleteCategory = (id: number) => {
    return () => {
      delCategory(id);
    };
  };

  return (
    <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>Настройки</Title>

      {/* Currency Settings */}
      <Card style={{ marginBottom: '24px' }} title="Дефолтная валюта">
        <Select
          style={{ width: '100%' }}
          value={defaultCurrency}
          onChange={selectDefaultCurrency}
          placeholder="Выберите валюту"
          showSearch
          optionFilterProp="children"
        >
          {currencies
            .filter(currency => currency.is_active)
            .map((currency) => (
            <Select.Option key={currency.id} value={currency.id}>
              {currency.name} ({currency.code})
            </Select.Option>
          ))}
        </Select>
      </Card>

      {/* Active Currencies */}
      <Card style={{ marginBottom: '24px' }} title="Активные валюты">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {currencies
            .filter(c => c.is_active)
            .map((currency) => (
              <div key={currency.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '12px', 
                border: '1px solid #d9d9d9', 
                borderRadius: '8px' 
              }}>
                <Space>
                  <span style={{ fontSize: '20px' }}>{currency.symbol}</span>
                  <div>
                    <div style={{ fontWeight: 500 }}>{currency.code}</div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{currency.name}</Text>
                  </div>
                </Space>
                <Checkbox
                  checked={currency.is_active}
                  onChange={(e) => handleActiveCurrencyToggle(currency.id, e.target.checked)}
                  disabled={currency.id === defaultCurrency}
                />
              </div>
            ))
          }
          
          <div style={{ paddingTop: '8px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>Добавить другие валюты:</Text>
            <div style={{ marginTop: '8px', maxHeight: '160px', overflowY: 'auto' }}>
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                {currencies.filter(c => 
                  !c.is_active
                ).map((currency) => (
                  <div key={currency.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '8px', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}>
                    <Space size="small">
                      <span>{currency.symbol}</span>
                      <Text style={{ fontSize: '12px' }}>{currency.code} - {currency.name}</Text>
                    </Space>
                    <Checkbox
                      checked={false}
                      onChange={(e) => handleActiveCurrencyToggle(currency.id, e.target.checked)}
                    />
                  </div>
                ))}
              </Space>
            </div>
          </div>
        </Space>
      </Card>

      {/* Exchange Rates */}
      <Card style={{ marginBottom: '24px' }} title="Курсы валют">
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Text>Ручной ввод курсов (относительно {currencies.find(c => c.id === defaultCurrency)?.code})</Text>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {currencies
                .filter(c => c.is_active)
                .map((currId) => {
                  const currency = currencies.find(c => c.id === currId.id);
                  if (!currency) return null;
                  const manualRate = manualRates.find((rate) => rate.id === currency.id);

                  return (
                    <Space key={currId.id} direction="vertical" size="small">
                      <Text style={{ fontSize: '12px' }}>{currency.code}</Text>
                      <Input
                        type="number"
                        step="0.000001"
                        value={manualRate?.rate ?? ''}
                        onChange={(e) => handleManualRateChange(currency.id, e.target.value)}
                        disabled={currId.id === defaultCurrency}
                      />
                    </Space>
                  );
                })}
              </div>
              <Button 
                type="primary"
                onClick={handleSaveManualRates}
                loading={isSavingRates}
                style={{ width: '100%', backgroundColor: '#2078F3', borderColor: '#2078F3' }}
              >
                Сохранить курсы
              </Button>
            </Space>
          }
        </Space>
      </Card>

      {/* Categories Management */}
      <Card 
        style={{ marginBottom: '24px' }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Управление категориями</span>
            <Button 
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsAddDialogOpen(true)}
              style={{ backgroundColor: '#2078F3', borderColor: '#2078F3' }}
            >
              Добавить
            </Button>
          </div>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          {categories.map((category) => (
            <div
              key={category.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                border: '1px solid #d9d9d9',
                borderRadius: '8px',
                transition: 'background-color 0.2s'
              }}
            >
              <Space>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: category.color + '20'
                  }}
                >
                  <span>{getCategoryIconSymbol(category)}</span>
                </div>
                <Text>{category.name}</Text>
              </Space>
              <Space size="small">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => {
                    handleEditCategory(category);
                    setIsAddDialogOpen(true);
                  }}
                />
                <Button
                  type="text"
                  icon={<DeleteOutlined style={{ fontSize: 16, color: '#8c8c8c' }} />}
                  onClick={deleteCategory(category.id)}
                />
              </Space>
            </div>
          ))}
        </Space>
      </Card>

      {/* Add/Edit Category Modal */}
      <Modal
        title={editingCategory ? 'Редактировать категорию' : 'Новая категория'}
        open={isAddDialogOpen}
        onCancel={() => {
          setIsAddDialogOpen(false);
          setEditingCategory(null);
          setNewCategoryName('');
          setNewCategoryIcon('📦');
          setNewCategoryColor('#2078F3');
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setIsAddDialogOpen(false);
            setEditingCategory(null);
          }}>
            Отмена
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
            style={{ backgroundColor: '#2078F3', borderColor: '#2078F3' }}
          >
            {editingCategory ? 'Сохранить изменения' : 'Добавить категорию'}
          </Button>
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text>Название</Text>
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Название категории"
              style={{ marginTop: '8px' }}
            />
          </div>
          
          <div>
            <Text>Иконка</Text>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(8, 1fr)', 
              gap: '8px',
              marginTop: '8px'
            }}>
              {categoryIcons.map((icon) => {
                const emoji = icon.emoji ?? icon.emojy ?? '';
                if (!emoji) {
                  return null;
                }

                return (
                  <button
                    key={icon.id}
                    type="button"
                    onClick={() => setNewCategoryIcon(emoji)}
                    style={{
                      border: `2px solid ${newCategoryIcon === emoji ? '#2078F3' : '#d9d9d9'}`,
                      borderRadius: '4px',
                      backgroundColor: newCategoryIcon === emoji ? '#E8F1FF' : 'white',
                      cursor: 'pointer',
                      fontSize: '16px',
                    }}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* <div>
            <Text>Цвет</Text>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(5, 1fr)', 
              gap: '8px',
              marginTop: '8px'
            }}>
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewCategoryColor(color)}
                  style={{
                    height: '40px',
                    border: `2px solid ${newCategoryColor === color ? '#000' : '#d9d9d9'}`,
                    borderRadius: '4px',
                    backgroundColor: color,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                />
              ))}
            </div>
          </div> */}
        </Space>
      </Modal>
    </div>
  );
}
