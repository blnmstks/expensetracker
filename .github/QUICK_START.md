# 🚀 Quick Start: Auto Version & Release

## Быстрая настройка (5 минут)

### 1. Создайте GitHub Personal Access Token

1. Откройте: https://github.com/settings/tokens/new
2. Настройте:
   - **Note**: `ExpenseTracker Auto Version`
   - **Expiration**: `90 days`
   - **Scopes**: ✅ `repo` + ✅ `workflow`
3. Нажмите **Generate token**
4. **Скопируйте токен** (показывается только один раз!)

### 2. Добавьте токен в GitHub Secrets

1. Откройте: https://github.com/blnmstks/expensetracker/settings/secrets/actions
2. Нажмите **New repository secret**
3. Name: `PAT_TOKEN`
4. Secret: *вставьте скопированный токен*
5. Нажмите **Add secret**

### 3. Создайте Sentry Auth Token

1. Откройте: https://sentry.io/settings/account/api/auth-tokens/
2. Нажмите **Create New Token**
3. Настройте:
   - **Name**: `ExpenseTracker CI`
   - **Scopes**: ✅ `project:read`, ✅ `project:releases`, ✅ `project:write`, ✅ `org:read`
4. Нажмите **Create Token**
5. **Скопируйте токен**

### 4. Добавьте Sentry токены в GitHub Secrets

Откройте: https://github.com/blnmstks/expensetracker/settings/secrets/actions

Добавьте два секрета:

**SENTRY_AUTH_TOKEN:**
- Name: `SENTRY_AUTH_TOKEN`
- Secret: *вставьте Sentry токен*

**SENTRY_DSN:**
- Name: `SENTRY_DSN`
- Secret: *скопируйте из https://sentry.io/settings/jemal-rm/projects/javascript-react/keys/*

### 5. Настройте Actions права

1. Откройте: https://github.com/blnmstks/expensetracker/settings/actions
2. **Workflow permissions** → выберите:
   - ✅ **Read and write permissions**
   - ✅ **Allow GitHub Actions to create and approve pull requests**
3. Нажмите **Save**

### 6. Добавьте переменные в Vercel

1. Откройте ваш проект в Vercel Dashboard
2. **Settings** → **Environment Variables**
3. Добавьте для **Production**:
   ```
   SENTRY_AUTH_TOKEN = <ваш_sentry_token>
   SENTRY_DSN = <ваш_sentry_dsn>
   NODE_ENV = production
   ```

---

## ✅ Готово! Теперь используйте

### Каждый раз когда мержите PR в `dev`:

1. **Добавьте label к PR** (опционально):
   - `patch` → 0.1.0 → 0.1.1 (по умолчанию)
   - `minor` → 0.1.0 → 0.2.0
   - `major` → 0.1.0 → 1.0.0

2. **Смержите PR** → workflow автоматически:
   - ✅ Увеличит версию
   - ✅ Создаст коммит в dev
   - ✅ Создаст git tag
   - ✅ Соберет приложение
   - ✅ Загрузит в Sentry
   - ✅ Создаст GitHub Release

### Пример:

```bash
# 1. Создайте фичу
git checkout -b feature/my-feature dev
git add .
git commit -m "feat: add something"
git push

# 2. Создайте PR на GitHub
# 3. Добавьте label "minor" (если нужно)
# 4. Смержите PR

# 🎉 Готово! Версия обновлена автоматически
```

---

## 🔍 Проверка

Откройте: https://github.com/blnmstks/expensetracker/actions

Вы должны увидеть успешно завершенный workflow "Auto Version and Sentry Release"

---

## 🐛 Проблемы?

Смотрите подробный troubleshooting: [WORKFLOW_CHECKLIST.md](WORKFLOW_CHECKLIST.md)
