import { useState } from 'react';
import { Plus, Trash2, Edit, Download, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from './ui/utils';
import type { Category, CurrencySettings } from '../App';
import { AVAILABLE_CURRENCIES } from '../App';

interface SettingsPageProps {
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onDeleteCategory: (id: string) => void;
  onUpdateCategory: (id: string, category: Partial<Category>) => void;
  currencySettings: CurrencySettings;
  onUpdateCurrencySettings: (settings: CurrencySettings) => void;
}

const EMOJI_OPTIONS = ['🛒', '🚗', '🎮', '💊', '👕', '📚', '🏠', '✈️', '☕', '🍔', '🎬', '💰', '🎵', '🏃', '🐕', '🌳'];
const COLOR_OPTIONS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#84cc16'];

export function SettingsPage({ 
  categories, 
  onAddCategory, 
  onDeleteCategory, 
  onUpdateCategory,
  currencySettings,
  onUpdateCurrencySettings 
}: SettingsPageProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📦');
  const [newCategoryColor, setNewCategoryColor] = useState('#10b981');
  const [defaultCurrencyOpen, setDefaultCurrencyOpen] = useState(false);
  const [manualRates, setManualRates] = useState(currencySettings.exchangeRates);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;

    onAddCategory({
      name: newCategoryName,
      icon: newCategoryIcon,
      color: newCategoryColor,
    });

    setNewCategoryName('');
    setNewCategoryIcon('📦');
    setNewCategoryColor('#10b981');
    setIsAddDialogOpen(false);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryIcon(category.icon);
    setNewCategoryColor(category.color);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !newCategoryName.trim()) return;

    onUpdateCategory(editingCategory.id, {
      name: newCategoryName,
      icon: newCategoryIcon,
      color: newCategoryColor,
    });

    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryIcon('📦');
    setNewCategoryColor('#10b981');
  };

  const handleExportData = () => {
    const expenses = localStorage.getItem('expenses') || '[]';
    const categoriesData = localStorage.getItem('categories') || '[]';
    const currencyData = localStorage.getItem('currencySettings') || '{}';
    
    const data = {
      expenses: JSON.parse(expenses),
      categories: JSON.parse(categoriesData),
      currencySettings: JSON.parse(currencyData),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.expenses) {
          localStorage.setItem('expenses', JSON.stringify(data.expenses));
        }
        if (data.categories) {
          localStorage.setItem('categories', JSON.stringify(data.categories));
        }
        if (data.currencySettings) {
          localStorage.setItem('currencySettings', JSON.stringify(data.currencySettings));
        }
        window.location.reload();
      } catch (error) {
        alert('Ошибка при импорте данных. Проверьте формат файла.');
      }
    };
    reader.readAsText(file);
  };

  const handleDefaultCurrencyChange = (currencyCode: string) => {
    const newActiveCurrencies = currencySettings.activeCurrencies.includes(currencyCode)
      ? currencySettings.activeCurrencies
      : [...currencySettings.activeCurrencies, currencyCode];

    onUpdateCurrencySettings({
      ...currencySettings,
      defaultCurrency: currencyCode,
      activeCurrencies: newActiveCurrencies,
    });
    setDefaultCurrencyOpen(false);
  };

  const handleActiveCurrencyToggle = (currencyCode: string, checked: boolean) => {
    if (currencyCode === currencySettings.defaultCurrency) return; // Can't deselect default

    const newActiveCurrencies = checked
      ? [...currencySettings.activeCurrencies, currencyCode]
      : currencySettings.activeCurrencies.filter(c => c !== currencyCode);

    onUpdateCurrencySettings({
      ...currencySettings,
      activeCurrencies: newActiveCurrencies,
    });
  };

  const handleSyncToggle = (checked: boolean) => {
    onUpdateCurrencySettings({
      ...currencySettings,
      syncWithGoogle: checked,
    });
  };

  const handleAdjustmentChange = (value: string) => {
    const num = parseInt(value);
    if (isNaN(num) || num < 0 || num > 9) return;
    
    onUpdateCurrencySettings({
      ...currencySettings,
      googleRateAdjustment: num,
    });
  };

  const handleManualRateChange = (currencyCode: string, value: string) => {
    const rate = parseFloat(value);
    if (isNaN(rate) || rate <= 0) return;

    const newRates = { ...manualRates, [currencyCode]: rate };
    setManualRates(newRates);
  };

  const handleSaveManualRates = () => {
    onUpdateCurrencySettings({
      ...currencySettings,
      exchangeRates: manualRates,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-neutral-900 mb-4">Настройки</h2>
      </div>

      {/* Currency Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Дефолтная валюта</CardTitle>
        </CardHeader>
        <CardContent>
          <Popover open={defaultCurrencyOpen} onOpenChange={setDefaultCurrencyOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span>
                  {AVAILABLE_CURRENCIES.find(c => c.code === currencySettings.defaultCurrency)?.name} ({currencySettings.defaultCurrency})
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Поиск валюты..." />
                <CommandList>
                  <CommandEmpty>Валюта не найдена.</CommandEmpty>
                  <CommandGroup>
                    {AVAILABLE_CURRENCIES.map((currency) => (
                      <CommandItem
                        key={currency.code}
                        value={`${currency.code} ${currency.name}`}
                        onSelect={() => handleDefaultCurrencyChange(currency.code)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{currency.name}</span>
                          <span className="text-neutral-500">{currency.code}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {/* Active Currencies */}
      <Card>
        <CardHeader>
          <CardTitle>Активные валюты</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {AVAILABLE_CURRENCIES.filter(c => 
              currencySettings.activeCurrencies.includes(c.code) || c.code === currencySettings.defaultCurrency
            ).map((currency) => (
              <div key={currency.code} className="flex items-center justify-between p-3 rounded-lg border border-neutral-200">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{currency.symbol}</span>
                  <div>
                    <div className="text-neutral-900">{currency.code}</div>
                    <div className="text-neutral-500 text-sm">{currency.name}</div>
                  </div>
                </div>
                <Checkbox
                  checked={currencySettings.activeCurrencies.includes(currency.code)}
                  onCheckedChange={(checked) => handleActiveCurrencyToggle(currency.code, checked as boolean)}
                  disabled={currency.code === currencySettings.defaultCurrency}
                />
              </div>
            ))}
            
            <div className="pt-2">
              <Label className="text-sm text-neutral-500">Добавить другие валюты:</Label>
              <div className="mt-2 max-h-40 overflow-y-auto space-y-2">
                {AVAILABLE_CURRENCIES.filter(c => 
                  !currencySettings.activeCurrencies.includes(c.code) && c.code !== currencySettings.defaultCurrency
                ).map((currency) => (
                  <div key={currency.code} className="flex items-center justify-between p-2 rounded hover:bg-neutral-50">
                    <div className="flex items-center gap-2">
                      <span>{currency.symbol}</span>
                      <span className="text-sm text-neutral-700">{currency.code} - {currency.name}</span>
                    </div>
                    <Checkbox
                      checked={false}
                      onCheckedChange={(checked) => handleActiveCurrencyToggle(currency.code, checked as boolean)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exchange Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Курсы валют</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-200">
            <div>
              <Label>Синхронизация с курсом Google</Label>
              <p className="text-sm text-neutral-500 mt-1">
                Автоматически обновлять курсы валют
              </p>
            </div>
            <Switch
              checked={currencySettings.syncWithGoogle}
              onCheckedChange={handleSyncToggle}
            />
          </div>

          {currencySettings.syncWithGoogle && (
            <div className="space-y-2">
              <Label htmlFor="adjustment">Корректировка курса</Label>
              <div className="flex items-center gap-2">
                <span className="text-neutral-500">+</span>
                <Input
                  id="adjustment"
                  type="number"
                  min="0"
                  max="9"
                  value={currencySettings.googleRateAdjustment}
                  onChange={(e) => handleAdjustmentChange(e.target.value)}
                  className="w-20"
                />
                <span className="text-neutral-500">%</span>
              </div>
            </div>
          )}

          {!currencySettings.syncWithGoogle && (
            <div className="space-y-3">
              <Label>Ручной ввод курсов (относительно {currencySettings.defaultCurrency})</Label>
              <div className="grid grid-cols-2 gap-3">
                {currencySettings.activeCurrencies.map((currCode) => (
                  <div key={currCode} className="space-y-1">
                    <Label htmlFor={`rate-${currCode}`} className="text-sm">
                      {currCode}
                    </Label>
                    <Input
                      id={`rate-${currCode}`}
                      type="number"
                      step="0.01"
                      value={manualRates[currCode] || 1}
                      onChange={(e) => handleManualRateChange(currCode, e.target.value)}
                      disabled={currCode === currencySettings.defaultCurrency}
                    />
                  </div>
                ))}
              </div>
              <Button 
                onClick={handleSaveManualRates}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                Сохранить курсы
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categories Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Управление категориями</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Добавить
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новая категория</DialogTitle>
                <DialogDescription>
                  Создайте новую категорию для классификации ваших расходов.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Название</Label>
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Название категории"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Иконка</Label>
                  <div className="grid grid-cols-8 gap-2">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewCategoryIcon(emoji)}
                        className={`p-2 rounded border-2 transition-colors ${
                          newCategoryIcon === emoji
                            ? 'border-emerald-600 bg-emerald-50'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Цвет</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewCategoryColor(color)}
                        className={`h-10 rounded border-2 transition-colors ${
                          newCategoryColor === color
                            ? 'border-neutral-900'
                            : 'border-neutral-200'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={handleAddCategory} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Добавить категорию
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    <span>{category.icon}</span>
                  </div>
                  <span className="text-neutral-900">{category.name}</span>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Редактировать категорию</DialogTitle>
                        <DialogDescription>
                          Измените название, иконку или цвет категории.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label>Название</Label>
                          <Input
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Название категории"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Иконка</Label>
                          <div className="grid grid-cols-8 gap-2">
                            {EMOJI_OPTIONS.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => setNewCategoryIcon(emoji)}
                                className={`p-2 rounded border-2 transition-colors ${
                                  newCategoryIcon === emoji
                                    ? 'border-emerald-600 bg-emerald-50'
                                    : 'border-neutral-200 hover:border-neutral-300'
                                }`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Цвет</Label>
                          <div className="grid grid-cols-5 gap-2">
                            {COLOR_OPTIONS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setNewCategoryColor(color)}
                                className={`h-10 rounded border-2 transition-colors ${
                                  newCategoryColor === color
                                    ? 'border-neutral-900'
                                    : 'border-neutral-200'
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                        <Button onClick={handleUpdateCategory} className="w-full bg-emerald-600 hover:bg-emerald-700">
                          Сохранить изменения
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => onDeleteCategory(category.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Управление данными</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleExportData}
            >
              <Download className="w-4 h-4 mr-2" />
              Экспорт данных
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => document.getElementById('import-file')?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Импорт данных
              <input
                id="import-file"
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportData}
              />
            </Button>
          </div>
          <Alert>
            <AlertDescription>
              Экспорт сохранит все ваши данные в JSON файл. Импорт восстановит данные из ранее сохранённого файла.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
