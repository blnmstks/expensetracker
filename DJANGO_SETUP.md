# 🔧 Настройка Django Backend для работы с фронтендом

## ✅ Что было исправлено:

### 1. Добавлены trailing slashes ко всем URL
Django REST Framework требует `/` в конце URL. Теперь все endpoints используют:
- ✅ `/api/expenses/` (правильно)
- ❌ `/api/expenses` (неправильно - вызывает 301 redirect)

---

## ⚠️ КРИТИЧНО: Настройка CORS для Session Authentication

Ваш бэкенд использует **Session Authentication с cookies**. Это требует специальной настройки CORS!

### Установка пакета:

```bash
pip install django-cors-headers
```

### Настройка в `settings.py`:

```python
# 1. Добавьте в INSTALLED_APPS
INSTALLED_APPS = [
    # ...
    'corsheaders',
    # ...
]

# 2. Добавьте middleware (ВАЖНО: до CommonMiddleware)
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # <-- Добавьте здесь
    'django.middleware.common.CommonMiddleware',
    # ...
]

# 3. ВАЖНО! Для Session Auth НЕ используйте CORS_ALLOW_ALL_ORIGINS
# Используйте только CORS_ALLOWED_ORIGINS с конкретными доменами:

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",
]

# 4. КРИТИЧНО! Разрешите credentials (cookies, session)
CORS_ALLOW_CREDENTIALS = True

# 5. Разрешите нужные методы
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# 6. Разрешите нужные заголовки (включая X-CSRFToken!)
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',  # ВАЖНО для Django CSRF
    'x-requested-with',
]

# 7. Для Session Auth также добавьте:
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]

# 8. Настройки CSRF для cross-origin
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_HTTPONLY = False  # Важно! Иначе JS не сможет прочитать токен
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_HTTPONLY = True
```

---

## � Добавьте CSRF endpoint (опционально, но рекомендуется)

Создайте view для получения CSRF токена в `views.py`:

```python
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie

@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'detail': 'CSRF cookie set'})
```

Добавьте в `urls.py`:

```python
urlpatterns = [
    # ...
    path('api/csrf/', get_csrf_token, name='csrf'),
]
```

---

## �🔐 Настройка аутентификации

Ваш бэкенд требует аутентификацию. Вот несколько вариантов:

### Вариант 1: Отключить аутентификацию для разработки

В `settings.py`:

```python
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',  # Разрешить всем
    ]
}
```

### Вариант 2: Token Authentication (рекомендуется)

#### Установка:
```bash
pip install djangorestframework djangorestframework-simplejwt
```

#### Настройка в `settings.py`:

```python
INSTALLED_APPS = [
    # ...
    'rest_framework',
    'rest_framework.authtoken',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ]
}

# JWT Settings
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

#### URLs для аутентификации (`urls.py`):

```python
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # ...
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
```

#### Использование во фронтенде:

```typescript
import { authAPI } from './services/api';

// Логин
const response = await authAPI.login('user@example.com', 'password');
// Токен автоматически сохраняется в localStorage
// Все последующие запросы будут содержать токен в заголовке Authorization

// Теперь можно делать запросы
const expenses = await expenseAPI.getAll(); // ✅ Работает с токеном
```

---

## 🧪 Тестирование настройки

### 1. Проверьте CORS:

```bash
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: authorization" \
     -X OPTIONS \
     http://localhost:8000/api/expenses/
```

Должны увидеть заголовки:
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, ...
```

### 2. Проверьте аутентификацию:

```bash
# Получить токен
curl -X POST http://localhost:8000/api/auth/login/ \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin"}'

# Использовать токен
curl http://localhost:8000/api/expenses/ \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📝 Checklist для бэкенда:

- [ ] Установлен `django-cors-headers`
- [ ] CORS middleware добавлен в `MIDDLEWARE`
- [ ] Настроен `CORS_ALLOWED_ORIGINS` или `CORS_ALLOW_ALL_ORIGINS = True`
- [ ] Настроена аутентификация (Token или AllowAny)
- [ ] Все URLs заканчиваются на `/` (trailing slash)
- [ ] Перезапущен сервер Django после изменений

---

## 🚀 После настройки бэкенда:

1. **Перезапустите Django сервер**:
   ```bash
   python manage.py runserver 8000
   ```

2. **Перезапустите Vite dev server** (если нужно):
   ```bash
   npm run dev
   ```

3. **Проверьте в консоли браузера**:
   - Не должно быть ошибок CORS
   - Не должно быть ошибок 301 Redirect
   - Запросы должны проходить успешно

---

## 💡 Дополнительные советы:

### Если используете Django Session Auth:
```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
}

# Также добавьте
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = ['http://localhost:5173']
```

### Если нужна пагинация:
```python
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 100
}
```

---

## ❗ Частые ошибки:

1. **301 Redirect** → Добавьте `/` в конце URL ✅ (Исправлено)
2. **CORS error** → Установите и настройте `django-cors-headers`
3. **401 Unauthorized** → Настройте аутентификацию или отключите её для разработки
4. **404 Not Found** → Проверьте URLs в Django (используйте `/api/expenses/`)

---

## 📞 Если проблемы остались:

Проверьте консоль браузера (F12) и скопируйте полный текст ошибки.
Проверьте терминал Django на наличие ошибок.
