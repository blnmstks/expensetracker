# 🔥 БЫСТРОЕ РЕШЕНИЕ - Session Auth + CORS

## ✅ Проблема найдена и исправлена!

Ваш бэкенд использует **Django Session Authentication с cookies**, но не были настроены:
1. ❌ `withCredentials: true` в axios (cookies не отправлялись)
2. ❌ CORS с поддержкой credentials на бэкенде
3. ❌ CSRF токен не читался из cookies

---

## 🚀 Что уже исправлено на фронтенде:

### ✅ В `src/lib/axios.ts` добавлено:
- `withCredentials: true` - отправка cookies
- `xsrfCookieName: 'csrftoken'` - чтение CSRF токена
- `xsrfHeaderName: 'X-CSRFToken'` - отправка CSRF в заголовке
- Функция `getCookie()` для чтения CSRF из cookies
- Улучшенная обработка ошибок

---

## ⚡ ЧТО СДЕЛАТЬ НА БЭКЕНДЕ (СРОЧНО):

### Шаг 1: Установите django-cors-headers

```bash
pip install django-cors-headers
```

### Шаг 2: Добавьте в `settings.py`:

```python
# INSTALLED_APPS
INSTALLED_APPS = [
    # ...
    'corsheaders',
    # ...
]

# MIDDLEWARE (corsheaders ПЕРЕД CommonMiddleware!)
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # <-- Сюда
    'django.middleware.common.CommonMiddleware',
    # ...
]

# CORS настройки для Session Auth
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]

CORS_ALLOW_CREDENTIALS = True  # КРИТИЧНО для cookies!

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'origin',
    'user-agent',
    'x-csrftoken',  # Для Django CSRF
    'x-requested-with',
]

# CSRF настройки
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]

CSRF_COOKIE_HTTPONLY = False  # ВАЖНО! JS должен читать CSRF токен
CSRF_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SAMESITE = 'Lax'
```

### Шаг 3: Перезапустите Django

```bash
python manage.py runserver 8000
```

---

## 🧪 Тестирование:

### 1. Проверьте CORS headers:

```bash
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: x-csrftoken" \
     -X OPTIONS \
     -v \
     http://localhost:8000/api/expenses/ 2>&1 | grep "Access-Control"
```

Должны увидеть:
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
```

### 2. Перезапустите Vite dev server:

```bash
npm run dev
```

### 3. Откройте консоль браузера (F12) и проверьте:

- ✅ Должны появиться cookies (sessionid, csrftoken)
- ✅ Запросы должны отправляться с заголовком `X-CSRFToken`
- ✅ Не должно быть ошибок CORS

---

## 💡 Как работает Session Auth:

1. **Первый запрос** → Django создаёт session и отправляет cookies:
   - `sessionid` - ID сессии
   - `csrftoken` - CSRF токен

2. **Последующие запросы** → Axios автоматически:
   - Отправляет cookies благодаря `withCredentials: true`
   - Читает `csrftoken` из cookies
   - Добавляет заголовок `X-CSRFToken`

3. **Django проверяет**:
   - Session валидна?
   - CSRF токен совпадает?
   - Origin разрешён в CORS?

---

## ❗ Частые ошибки и решения:

### Ошибка: "CSRF Failed: CSRF token missing"
**Решение:** Убедитесь что `CSRF_COOKIE_HTTPONLY = False`

### Ошибка: "CORS policy: credentials mode is 'include'"
**Решение:** Замените `CORS_ALLOW_ALL_ORIGINS` на `CORS_ALLOWED_ORIGINS` со списком

### Ошибка: 403 Forbidden
**Решения:**
1. Проверьте настройки CORS
2. Проверьте что есть `CSRF_TRUSTED_ORIGINS`
3. Проверьте что `CORS_ALLOW_CREDENTIALS = True`

### Cookies не сохраняются
**Решение:** 
- Убедитесь что `withCredentials: true` в axios ✅ (уже сделано)
- Проверьте настройки SameSite в Django

---

## 📝 Checklist:

На бэкенде:
- [ ] Установлен `django-cors-headers`
- [ ] Добавлен в `INSTALLED_APPS`
- [ ] Middleware добавлен **ПЕРЕД** CommonMiddleware
- [ ] `CORS_ALLOWED_ORIGINS` содержит `http://localhost:5173`
- [ ] `CORS_ALLOW_CREDENTIALS = True`
- [ ] `CSRF_COOKIE_HTTPONLY = False`
- [ ] `CSRF_TRUSTED_ORIGINS` содержит `http://localhost:5173`
- [ ] Django перезапущен

На фронтенде:
- [x] `withCredentials: true` ✅
- [x] CSRF токен читается из cookies ✅
- [x] Vite dev server перезапущен

---

## 🎯 После настройки:

Откройте приложение в браузере и проверьте в DevTools:

**Application → Cookies:**
- Должны появиться `sessionid` и `csrftoken` от `localhost:8000`

**Network → запрос к /api/expenses/:**
- Request Headers: `Cookie: sessionid=...; csrftoken=...`
- Request Headers: `X-CSRFToken: ...`
- Response Status: 200 OK (не 403!)

---

Если всё настроено правильно, запросы заработают! 🚀
