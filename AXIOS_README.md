
## 🎯 Как использовать:

### Быстрый старт

```typescript
import { expenseAPI } from './services/api';
import { toast } from 'sonner';

// Получить все расходы
try {
  const expenses = await expenseAPI.getAll();
  console.log(expenses);
} catch (error) {
  console.error('Ошибка:', error);
  toast.error('Не удалось загрузить расходы');
}

// Создать расход
try {
  const newExpense = await expenseAPI.create({
    amount: 1000,
    currency: 'RUB',
    category: 'food',
    date: '2025-10-22',
    month: '2025-10',
    comment: 'Продукты'
  });
  toast.success('Расход добавлен');
} catch (error) {
  toast.error('Ошибка при добавлении');
}
```


## 📖 Доступные API методы:

### Расходы (expenseAPI)
- `getAll()` - получить все расходы
- `getById(id)` - получить по ID
- `create(expense)` - создать новый
- `update(id, updates)` - обновить
- `delete(id)` - удалить
- `getByPeriod(start, end)` - за период
- `getByCategory(categoryId)` - по категории

### Категории (categoryAPI)
- `getAll()` - получить все
- `getById(id)` - получить по ID
- `create(category)` - создать
- `update(id, updates)` - обновить
- `delete(id)` - удалить

### Валюты (currencyAPI)
- `getSettings()` - получить настройки
- `updateSettings(settings)` - обновить
- `getExchangeRates(base)` - курсы валют

### Аналитика (analyticsAPI)
- `getCategoryStats(start, end)` - по категориям
- `getOverallStats(start, end)` - общая
- `getTrends(period)` - тренды

### Аутентификация (authAPI)
- `login(email, password)` - вход
- `register(email, password, name)` - регистрация
- `logout()` - выход
- `getCurrentUser()` - текущий пользователь

---

## 💡 Интеграция в существующие компоненты:

### Было (localStorage):
```typescript
const addExpense = (expense: Omit<Expense, "id">) => {
  const newExpense = {
    ...expense,
    id: Date.now().toString(),
  };
  setExpenses([newExpense, ...expenses]);
};
```

### Стало (API):
```typescript
const addExpense = async (expense: Omit<Expense, "id">) => {
  try {
    setLoading(true);
    const newExpense = await expenseAPI.create(expense);
    setExpenses([newExpense, ...expenses]);
    toast.success('Расход добавлен');
  } catch (error) {
    console.error('Ошибка:', error);
    toast.error('Не удалось добавить расход');
  } finally {
    setLoading(false);
  }
};
```

---

## 🔒 Аутентификация:

Токен автоматически:
- Сохраняется в localStorage при входе
- Добавляется ко всем запросам
- Удаляется при выходе

```typescript
// Вход
await authAPI.login('user@example.com', 'password');
// Токен сохранен, все последующие запросы авторизованы

// Выход
await authAPI.logout();
// Токен удален
```

---

## 📚 Дополнительные материалы:

- **AXIOS_SETUP.md** - подробная документация
- **ExpenseListWithAPI.tsx** - полный пример компонента

---

## 🐛 Troubleshooting:

### Ошибка "Network Error"
- Проверьте, запущен ли бэкенд сервер
- Проверьте URL в `.env`
- Проверьте CORS на бэкенде

### Ошибка 401
- Токен истек или невалиден
- Выполните вход заново

### Переменная окружения не работает
- Перезапустите dev сервер
- Убедитесь, что переменная начинается с `VITE_`

---

## 🎉 Готово к использованию!

Теперь вы можете:
1. Запустить бэкенд сервер
2. Настроить URL в `.env`
3. Заменить localStorage на API вызовы
4. Наслаждаться полноценным взаимодействием с сервером!

Удачи! 🚀
