# Использование API с Axios

## Настройка завершена! ✅

Я настроил axios для работы с вашим бэкендом. Вот что было создано:

### 📁 Структура файлов:

1. **`src/lib/axios.ts`** - Основной экземпляр axios с настройками
2. **`src/services/api.ts`** - API сервисы для всех операций
3. **`.env`** - Переменные окружения
4. **`src/vite-env.d.ts`** - TypeScript типы для переменных окружения

### 🔧 Основные возможности:

#### ✅ Автоматическое добавление токена авторизации
- Токен берется из `localStorage` и добавляется к каждому запросу

#### ✅ Обработка ошибок
- Автоматическая обработка ошибок 401, 403, 404, 500
- Логирование ошибок в консоль

#### ✅ Настройка базового URL
- URL задается через переменную окружения `VITE_API_URL`
- По умолчанию: `http://localhost:3000/api`

#### ✅ Timeout
- Таймаут запросов: 10 секунд

---

## 📝 Примеры использования:

### 1. Работа с расходами

\`\`\`typescript
import { expenseAPI } from './services/api';

// Получить все расходы
const expenses = await expenseAPI.getAll();

// Создать новый расход
const newExpense = await expenseAPI.create({
  amount: 100,
  currency: 'USD',
  category: 'food',
  date: '2025-10-22',
  month: '2025-10',
  comment: 'Покупка продуктов'
});

// Обновить расход
await expenseAPI.update('expense-id', { amount: 150 });

// Удалить расход
await expenseAPI.delete('expense-id');

// Получить расходы за период
const periodExpenses = await expenseAPI.getByPeriod('2025-10-01', '2025-10-31');
\`\`\`

### 2. Работа с категориями

\`\`\`typescript
import { categoryAPI } from './services/api';

// Получить все категории
const categories = await categoryAPI.getAll();

// Создать категорию
const newCategory = await categoryAPI.create({
  name: 'Транспорт',
  color: '#3b82f6',
  icon: '🚗'
});

// Обновить категорию
await categoryAPI.update('category-id', { name: 'Автотранспорт' });

// Удалить категорию
await categoryAPI.delete('category-id');
\`\`\`

### 3. Работа с валютами

\`\`\`typescript
import { currencyAPI } from './services/api';

// Получить настройки валют
const settings = await currencyAPI.getSettings();

// Обновить настройки
await currencyAPI.updateSettings({
  defaultCurrency: 'USD',
  activeCurrencies: ['USD', 'EUR', 'RUB'],
  exchangeRates: { USD: 1, EUR: 0.85, RUB: 92 },
  syncWithGoogle: true,
  googleRateAdjustment: 0
});

// Получить актуальные курсы валют
const rates = await currencyAPI.getExchangeRates('USD');
\`\`\`

### 4. Аналитика

\`\`\`typescript
import { analyticsAPI } from './services/api';

// Статистика по категориям
const categoryStats = await analyticsAPI.getCategoryStats('2025-10-01', '2025-10-31');

// Общая статистика
const overallStats = await analyticsAPI.getOverallStats('2025-10-01', '2025-10-31');

// Тренды
const trends = await analyticsAPI.getTrends('month');
\`\`\`

### 5. Аутентификация

\`\`\`typescript
import { authAPI } from './services/api';

// Вход
const loginResponse = await authAPI.login('user@example.com', 'password');
// Токен автоматически сохраняется в localStorage

// Регистрация
await authAPI.register('user@example.com', 'password', 'John Doe');

// Получить текущего пользователя
const currentUser = await authAPI.getCurrentUser();

// Выход
await authAPI.logout();
// Токен автоматически удаляется из localStorage
\`\`\`

---

## 🔧 Интеграция в компоненты React

### Пример использования в компоненте с обработкой ошибок:

\`\`\`typescript
import { useState, useEffect } from 'react';
import { expenseAPI } from './services/api';
import { toast } from './components/ui/sonner';

function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await expenseAPI.getAll();
      setExpenses(data);
    } catch (error) {
      console.error('Ошибка загрузки расходов:', error);
      toast.error('Не удалось загрузить расходы');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await expenseAPI.delete(id);
      toast.success('Расход удален');
      // Обновляем список
      setExpenses(expenses.filter(exp => exp.id !== id));
    } catch (error) {
      console.error('Ошибка удаления:', error);
      toast.error('Не удалось удалить расход');
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div>
      {expenses.map(expense => (
        <div key={expense.id}>
          {expense.amount} {expense.currency}
          <button onClick={() => handleDelete(expense.id)}>Удалить</button>
        </div>
      ))}
    </div>
  );
}
\`\`\`

---

## ⚙️ Настройка переменных окружения

### Для локальной разработки (.env):
\`\`\`
VITE_API_URL=http://localhost:3000/api
\`\`\`

### Для production (.env.production):
\`\`\`
VITE_API_URL=https://api.yourbackend.com/api
\`\`\`

**Важно:** Перезапустите dev сервер после изменения `.env` файлов!

\`\`\`bash
npm run dev
\`\`\`

---

## 🚀 Следующие шаги:

1. **Настройте URL вашего бэкенда** в файле `.env`
2. **Замените localStorage на API вызовы** в компонентах
3. **Добавьте обработку загрузки** (loading states)
4. **Используйте toast уведомления** для показа ошибок и успешных операций

---

## 💡 Полезные советы:

- Используйте `try/catch` для обработки ошибок
- Показывайте пользователю loading состояния
- Используйте toast для уведомлений об успехе/ошибке
- Токен авторизации автоматически добавляется ко всем запросам
- Все типы уже настроены и соответствуют вашему приложению

---

## 🔒 Безопасность:

- Токены хранятся в localStorage
- Автоматическое добавление Bearer токена к запросам
- Обработка 401 ошибок (неавторизованный доступ)
- Timeout для предотвращения зависания запросов
