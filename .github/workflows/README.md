# GitHub Actions Workflows

## Auto Version and Sentry Release

Автоматически увеличивает версию приложения и создает релиз при мерже PR в `dev`.

### Как это работает

1. **Мержите PR в dev** с одним из labels:
   - `patch` - увеличивает версию 0.1.0 → 0.1.1 (по умолчанию)
   - `minor` - увеличивает версию 0.1.0 → 0.2.0
   - `major` - увеличивает версию 0.1.0 → 1.0.0

2. **Workflow автоматически**:
   - ✅ Увеличивает версию в package.json
   - ✅ Создает коммит с новой версией
   - ✅ Создает git tag (v0.1.1)
   - ✅ Собирает приложение
   - ✅ Загружает source maps в Sentry
   - ✅ Создает релиз в Sentry
   - ✅ Создает GitHub Release

### Необходимые секреты

Добавьте в **Settings → Secrets and variables → Actions**:

#### PAT_TOKEN (обязательно)
Personal Access Token с правами:
- `repo` - Full control of private repositories
- `workflow` - Update GitHub Action workflows

Создать: https://github.com/settings/tokens

#### SENTRY_AUTH_TOKEN (обязательно для Sentry)
Auth token с правами:
- `project:read`
- `project:releases`
- `project:write`
- `org:read`

Создать: https://sentry.io/settings/account/api/auth-tokens/

#### SENTRY_DSN (обязательно для Sentry)
DSN вашего проекта в Sentry.

Найти: https://sentry.io/settings/jemal-rm/projects/javascript-react/keys/

### Пример использования

```bash
# 1. Создайте ветку для фичи
git checkout -b feature/new-feature dev

# 2. Сделайте изменения
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# 3. Создайте PR в GitHub UI
# 4. Добавьте label "patch" (или "minor"/"major")
# 5. Дождитесь ревью и смержите PR

# Workflow автоматически:
# - Увеличит версию
# - Создаст релиз
# - Обновит Sentry
```

### Troubleshooting

#### Ошибка: "Repository rule violations found"
Добавьте bypass для github-actions в Repository Rules:
1. Settings → Rules → Rulesets
2. Edit ruleset для dev
3. Bypass list → добавьте ваш аккаунт

#### Ошибка: "Permission denied"
Проверьте что PAT_TOKEN:
1. Создан от правильного аккаунта
2. Имеет все необходимые права
3. Не истек срок действия

#### Workflow не запускается
Проверьте что:
1. PR был смержен (не закрыт)
2. PR был в ветку dev
3. Workflow файл в правильной директории: `.github/workflows/`
