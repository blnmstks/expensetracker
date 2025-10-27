# Новая архитектура приложения с React Router

## 📁 Структура проекта

```
src/
├── App.tsx                    # Главный компонент, управление состоянием
├── main.tsx                   # Точка входа
│
├── routes/
│   └── index.tsx              # Конфигурация роутов
│
├── pages/                     # Страницы приложения
│   ├── ExpensesPage.tsx       # Страница добавления расходов
│   ├── AnalyticsPage.tsx      # Страница аналитики
│   ├── HistoryPage.tsx        # Страница истории
│   └── SettingsPage.tsx       # Страница настроек
│
├── components/                # Переиспользуемые компоненты
│   ├── layout/
│   │   └── MainLayout.tsx     # Основной лайаут с навигацией
│   ├── AddExpense.tsx         # Форма добавления расхода
│   ├── Analytics.tsx          # Компонент аналитики
│   ├── History.tsx            # Компонент истории
│   ├── SettingsPage.tsx       # Компонент настроек
│   ├── Login.tsx              # Компонент входа
│   └── ui/                    # UI компоненты
│
├── services/                  # API сервисы
│   ├── api.ts
│   └── authAPI.ts
│
└── styles/                    # Стили
    ├── globals.css
    └── antd-custom.css
```

## 🛣️ Роутинг

### Конфигурация роутов (`src/routes/index.tsx`)

```typescript
/                              # Корневой роут
├── /expenses                  # Добавление расходов (по умолчанию)
├── /analytics                 # Аналитика
├── /history                   # История
└── /settings                  # Настройки
```

### Как работает роутинг

1. **MainLayout** - это основной лайаут, который содержит:
   - Боковое меню (десктоп)
   - Верхний хедер с кнопкой меню (мобильный)
   - Нижний навбар (мобильный)
   - `<Outlet />` для рендеринга дочерних роутов

2. **Pages** - каждая страница обернута в ErrorBoundary и содержит соответствующий компонент

3. **Navigation** - при клике на пункт меню происходит навигация через `navigate()` из React Router

## 🔄 Поток данных

```
App.tsx (состояние)
    ↓
RouterProvider
    ↓
MainLayout (навигация + Outlet)
    ↓
Pages (обертки с ErrorBoundary)
    ↓
Components (формы и логика)
```

## ✅ Преимущества новой архитектуры

### 1. Четкое разделение ответственности
- **Pages** - страницы как логические единицы
- **Components** - переиспользуемые компоненты
- **Layout** - навигация и структура
- **Routes** - конфигурация маршрутов

### 2. Навбар виден на всех страницах
- Layout оборачивает все роуты
- Навбар всегда доступен
- Контент меняется через Outlet

### 3. Поддержка URL навигации
- Можно делиться ссылками на конкретные страницы
- Работает кнопка "Назад" в браузере
- Поддержка истории браузера

### 4. Легкость масштабирования
- Легко добавить новый роут
- Легко добавить вложенные роуты
- Легко добавить защищенные роуты

### 5. Улучшенная производительность
- React Router оптимизирует рендеринг
- Lazy loading роутов (можно добавить)
- Кеширование компонентов

## 🎯 Как добавить новую страницу

### Шаг 1: Создать компонент страницы
```typescript
// src/pages/NewPage.tsx
import ErrorBoundary, { SectionFallback } from '../components/ErrorBoundary';

export function NewPage() {
  return (
    <ErrorBoundary fallback={<SectionFallback name="Новая страница" />}>
      <div>Содержимое новой страницы</div>
    </ErrorBoundary>
  );
}
```

### Шаг 2: Добавить роут
```typescript
// src/routes/index.tsx
{
  path: 'new-page',
  element: <NewPage />,
}
```

### Шаг 3: Добавить пункт меню
```typescript
// src/components/layout/MainLayout.tsx
const menuItems: MenuItem[] = [
  // ...существующие пункты
  {
    key: 'new-page',
    icon: <YourIcon />,
    label: 'Новая страница',
  },
];
```

## 🔐 Защищенные роуты (для будущего)

Можно добавить обертку для защищенных роутов:

```typescript
// src/components/ProtectedRoute.tsx
function ProtectedRoute({ children }) {
  const isAuthenticated = // проверка авторизации
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
```

## 📱 Адаптивность

- **Десктоп** (≥768px): Боковое меню + контент
- **Мобильный** (<768px): Верхний хедер + контент + нижний навбар

Навбар теперь виден на всех страницах благодаря тому, что он находится в MainLayout, который оборачивает все роуты.

## 🚀 Дальнейшие улучшения

1. **Lazy Loading**
```typescript
const ExpensesPage = lazy(() => import('../pages/ExpensesPage'));
```

2. **Вложенные роуты**
```typescript
{
  path: 'analytics',
  element: <AnalyticsLayout />,
  children: [
    { path: 'monthly', element: <MonthlyAnalytics /> },
    { path: 'yearly', element: <YearlyAnalytics /> },
  ]
}
```

3. **Параметры URL**
```typescript
{
  path: 'expense/:id',
  element: <ExpenseDetail />,
}
```

4. **Loader для данных**
```typescript
{
  path: 'analytics',
  element: <AnalyticsPage />,
  loader: async () => {
    return fetch('/api/analytics');
  }
}
```
