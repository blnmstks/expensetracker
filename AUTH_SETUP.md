# 🔐 Авторизация настроена!

## ✅ Что добавлено:

### 1. **Компонент Login** (`src/components/Login.tsx`)
- Вкладки "Вход" и "Регистрация"
- Валидация форм
- Поддержка Google OAuth
- Красивый UI с использованием shadcn/ui

### 2. **API для авторизации** (`src/services/api.ts`)
Обновлены методы для работы с **allauth.headless**:
```typescript
authAPI.whoami()      // Проверка сессии
authAPI.login()       // Вход
authAPI.register()    // Регистрация
authAPI.logout()      // Выход
authAPI.getSession()  // Получить сессию
authAPI.googleStart() // Google OAuth
```

### 3. **Интеграция в App.tsx**
- Проверка авторизации при загрузке
- Редирект на Login, если не авторизован
- Кнопка выхода в сайдбаре (desktop) и хедере (mobile)
- Отображение email пользователя

---

## 🔧 Настройка бэкенда

Убедитесь, что на бэкенде настроено:

### 1. **CORS** (`settings.py`):
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
]

CORS_ALLOW_CREDENTIALS = True  # ВАЖНО для cookies!
```

### 2. **Session и CSRF**:
```python
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
]

SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SECURE = False  # True только для HTTPS
CSRF_COOKIE_SECURE = False     # True только для HTTPS
```

### 3. **Allauth Headless** настроен (уже есть в URLs):
```python
path("api/auth/", include("allauth.headless.urls")),
```

---

## 📝 Как это работает:

### **При загрузке приложения:**
```
1. App.tsx проверяет авторизацию через /whoami/
2. Если user.is_anonymous === false → показываем приложение
3. Если user.is_anonymous === true → показываем Login
```

### **При входе:**
```
1. Пользователь вводит email/password
2. POST /api/auth/login
3. Django создаёт сессию и устанавливает cookie
4. Axios автоматически добавляет CSRF token
5. Все последующие запросы идут с авторизацией
```

### **При создании расхода:**
```
1. POST /api/expenses/ (с cookies сессии)
2. Django видит request.user = CustomUser
3. Expense сохраняется с привязкой к пользователю
4. ✅ Успех!
```

---

## 🚀 Запуск

### 1. Проверьте переменные окружения:
```bash
# .env
VITE_API_URL=http://localhost:8000/api
```

### 2. Запустите фронтенд:
```bash
npm run dev
```

### 3. Убедитесь, что бэкенд работает:
```bash
# В другом терминале
python manage.py runserver
```

---

## 🧪 Тестирование

### 1. **Создайте тестового пользователя** (на бэкенде):
```bash
python manage.py createsuperuser
```

### 2. **Или зарегистрируйтесь** через форму на фронтенде

### 3. **Войдите** и попробуйте создать расход

---

## 🐛 Возможные проблемы

### Ошибка 403 Forbidden:
- Проверьте CORS настройки
- Убедитесь, что `withCredentials: true` в axios.ts
- Проверьте, что CSRF cookie установлен (DevTools → Application → Cookies)

### Ошибка "AnonymousUser":
- Проверьте, что cookies отправляются с запросом
- Проверьте SESSION_COOKIE_SAMESITE и CORS_ALLOW_CREDENTIALS
- Откройте DevTools → Network → выберите запрос → проверьте Cookie header

### Не работает Google OAuth:
- Проверьте настройки Google OAuth на бэкенде
- Убедитесь, что redirect_uri правильный
- Проверьте логи Django

---

## 📚 Структура файлов

```
src/
├── components/
│   ├── Login.tsx              ← НОВЫЙ: Компонент авторизации
│   ├── AddExpense.tsx         ← Обновлён
│   └── ...
├── services/
│   └── api.ts                 ← Обновлён: authAPI
├── lib/
│   └── axios.ts               ← Уже настроен (withCredentials)
└── App.tsx                    ← Обновлён: проверка auth
```

---

## 🎯 Следующие шаги

1. ✅ Авторизация работает
2. ⚠️ Нужно исправить типы в AddExpense (currency: number vs string)
3. 📝 Загружать расходы с бэкенда при входе
4. 🔄 Синхронизировать категории с бэкенда

---

## 💡 Полезные команды

### Проверить сессию в консоли браузера:
```javascript
fetch('http://localhost:8000/api/whoami/', { credentials: 'include' })
  .then(r => r.json())
  .then(console.log)
```

### Проверить cookies:
```javascript
console.log(document.cookie)
```

### Выйти через консоль:
```javascript
fetch('http://localhost:8000/api/auth/session', { 
  method: 'DELETE', 
  credentials: 'include' 
})
```
