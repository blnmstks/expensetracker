# 📋 Итоговая настройка Auto Version & Sentry Release

## ✅ Что было сделано

### 1. Workflow для автоматического версионирования
**Файл:** `.github/workflows/auto-version-and-release.yml`

**Что делает:**
- Автоматически увеличивает версию при мерже PR в `dev`
- Создает git tag
- Собирает приложение
- Загружает source maps в Sentry
- Создает релиз в Sentry
- Создает GitHub Release

### 2. Интеграция с Sentry
**Файлы:** `vite.config.ts`, `src/main.tsx`

**Что настроено:**
- Автоматическая загрузка source maps в production
- Привязка ошибок к релизам
- Отслеживание версий приложения
- ErrorBoundary с интеграцией Sentry

### 3. Документация
**Файлы:**
- `.github/QUICK_START.md` - быстрая настройка
- `.github/WORKFLOW_CHECKLIST.md` - чек-лист проверки
- `.github/workflows/README.md` - подробное описание

---

## 🚀 Что нужно сделать СЕЙЧАС

### 1. Настройте GitHub Secrets (5 минут)

Откройте: https://github.com/blnmstks/expensetracker/settings/secrets/actions

Добавьте 3 секрета:

#### PAT_TOKEN
1. Создайте: https://github.com/settings/tokens/new
2. Права: `repo` + `workflow`
3. Скопируйте и добавьте в Secrets как `PAT_TOKEN`

#### SENTRY_AUTH_TOKEN
1. Создайте: https://sentry.io/settings/account/api/auth-tokens/
2. Права: `project:read`, `project:releases`, `project:write`, `org:read`
3. Скопируйте и добавьте в Secrets как `SENTRY_AUTH_TOKEN`

#### SENTRY_DSN
1. Скопируйте из: https://sentry.io/settings/jemal-rm/projects/javascript-react/keys/
2. Добавьте в Secrets как `SENTRY_DSN`

### 2. Настройте Actions права

Откройте: https://github.com/blnmstks/expensetracker/settings/actions

Включите:
- ✅ **Read and write permissions**
- ✅ **Allow GitHub Actions to create and approve pull requests**

### 3. Добавьте переменные в Vercel

Откройте ваш проект в Vercel → Settings → Environment Variables

Добавьте для **Production**:
```
SENTRY_AUTH_TOKEN = <ваш_токен>
SENTRY_DSN = <ваш_dsn>
NODE_ENV = production
```

---

## 🎯 Как использовать

### Простой флоу:

```bash
# 1. Создайте ветку для фичи
git checkout -b feature/my-feature dev

# 2. Сделайте изменения
git add .
git commit -m "feat: add something cool"
git push origin feature/my-feature

# 3. Создайте PR на GitHub → dev
# 4. (Опционально) Добавьте label: patch/minor/major
# 5. Смержите PR

# 🎉 Workflow автоматически:
# - Увеличит версию (0.1.0 → 0.1.1)
# - Создаст коммит в dev
# - Создаст tag v0.1.1
# - Соберет приложение
# - Загрузит в Sentry
# - Создаст GitHub Release
```

### Labels для версионирования:
- `patch` → 0.1.0 → 0.1.**1** (по умолчанию)
- `minor` → 0.1.0 → 0.**2**.0
- `major` → 0.1.0 → **1**.0.0

---

## 🔍 Проверка работы

После мерже PR проверьте:

1. **GitHub Actions**: https://github.com/blnmstks/expensetracker/actions
   - ✅ Workflow "Auto Version and Sentry Release" завершился успешно

2. **GitHub Releases**: https://github.com/blnmstks/expensetracker/releases
   - ✅ Создан новый релиз с правильной версией

3. **Sentry Releases**: https://sentry.io/organizations/jemal-rm/releases/
   - ✅ Создан релиз в Sentry
   - ✅ Загружены source maps

4. **В ветке dev**:
   - ✅ package.json содержит новую версию
   - ✅ Есть коммит "chore: bump version to X.X.X"
   - ✅ Есть tag vX.X.X

---

## 📁 Структура файлов

```
.github/
├── workflows/
│   ├── auto-version-and-release.yml  # Основной workflow
│   └── README.md                      # Описание workflow
├── QUICK_START.md                     # Быстрая настройка (читайте первым!)
└── WORKFLOW_CHECKLIST.md              # Чек-лист проверки

vite.config.ts                         # Sentry plugin настроен
src/main.tsx                           # Sentry.init() настроен
package.json                           # build:prod использует NODE_ENV
```

---

## 🐛 Troubleshooting

### Workflow не запускается
- Проверьте что PR был **смержен** (не просто закрыт)
- Проверьте что PR был в ветку **dev**
- Проверьте что файл workflow в `.github/workflows/`

### Ошибка "Repository rule violations"
- Откройте Settings → Rules → Rulesets
- Добавьте ваш аккаунт в Bypass list

### Ошибка "Permission denied"
- Проверьте что PAT_TOKEN создан от правильного аккаунта
- Проверьте что токен имеет права `repo` + `workflow`
- Проверьте что токен не истек

### Sentry release не создается
- Workflow продолжит работу даже если Sentry упадет
- Проверьте что SENTRY_AUTH_TOKEN добавлен в secrets
- Проверьте логи в Actions для деталей

---

## 📚 Дополнительно

**Подробная документация:**
- Настройка: `.github/QUICK_START.md`
- Чек-лист: `.github/WORKFLOW_CHECKLIST.md`
- Workflow: `.github/workflows/README.md`

**Полезные ссылки:**
- GitHub Actions: https://github.com/blnmstks/expensetracker/actions
- GitHub Secrets: https://github.com/blnmstks/expensetracker/settings/secrets/actions
- Sentry Releases: https://sentry.io/organizations/jemal-rm/releases/
- Sentry Settings: https://sentry.io/settings/jemal-rm/projects/javascript-react/

---

## ✨ Следующие шаги

1. **Сначала**: Настройте секреты (см. раздел выше)
2. **Затем**: Создайте тестовый PR и смержите его
3. **Проверьте**: Что workflow отработал успешно
4. **Используйте**: При каждом мерже в dev версия будет обновляться автоматически

**Успехов! 🚀**
