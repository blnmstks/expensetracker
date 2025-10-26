# Тестирование API endpoints

## Проверка доступных endpoints:

Откройте консоль браузера (F12) и выполните:

### 1. Проверить whoami (получить CSRF):
```javascript
fetch('http://localhost:8000/api/whoami/', { 
  credentials: 'include' 
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

### 2. Проверить доступные auth endpoints:

```javascript
// Попробуйте разные варианты:

// Вариант 1: /api/auth/signup
fetch('http://localhost:8000/api/auth/signup', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@test.com',
    password: 'testpass123'
  })
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)

// Вариант 2: /api/auth/login
fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@test.com',
    password: 'testpass123'
  })
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

### 3. Проверить session endpoint:
```javascript
fetch('http://localhost:8000/api/auth/session', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

### 4. Посмотреть Swagger документацию:
Откройте в браузере:
```
http://localhost:8000/api/docs/
```

Там будут все доступные endpoints с правильными форматами запросов!

---

## Возможные URL паттерны для allauth.headless:

Согласно документации django-allauth headless, endpoints могут быть:

### Вариант 1 (по умолчанию):
- POST `/auth/login` - вход
- POST `/auth/signup` - регистрация
- DELETE `/auth/session` - выход
- GET `/auth/session` - получить сессию

### Вариант 2 (с версионированием):
- POST `/auth/app/v1/auth/login`
- POST `/auth/app/v1/auth/signup`

### Вариант 3 (если настроен prefix):
- POST `/accounts/login`
- POST `/accounts/signup`

---

## Быстрая диагностика в консоли браузера:

```javascript
// 1. Проверяем, есть ли CSRF cookie
console.log('Cookies:', document.cookie);

// 2. Получаем CSRF токен
async function getCSRF() {
  await fetch('http://localhost:8000/api/whoami/', { credentials: 'include' });
  console.log('CSRF получен, cookies:', document.cookie);
}
getCSRF();

// 3. Пробуем регистрацию
async function testSignup() {
  const response = await fetch('http://localhost:8000/api/auth/signup', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'TestPassword123!'
    })
  });
  
  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Data:', data);
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

testSignup();
```

---

## Проверка на бэкенде (Django shell):

```bash
python manage.py shell
```

```python
# Посмотреть URL patterns
from django.urls import get_resolver
resolver = get_resolver()
for pattern in resolver.url_patterns:
    print(pattern)

# Или конкретно для allauth:
from allauth.headless import urls
print(urls.urlpatterns)
```
