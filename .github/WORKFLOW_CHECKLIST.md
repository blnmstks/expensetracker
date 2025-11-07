# Чек-лист настройки Auto Version Workflow

## ✅ Проверьте перед использованием

### 1. GitHub Secrets
Откройте: https://github.com/blnmstks/expensetracker/settings/secrets/actions

Должны быть настроены:
- [ ] **PAT_TOKEN** - Personal Access Token
- [ ] **SENTRY_AUTH_TOKEN** - Sentry Auth Token
- [ ] **SENTRY_DSN** - Sentry DSN

### 2. PAT Token настроен правильно
1. Создан на: https://github.com/settings/tokens
2. Права:
   - [ ] `repo` (Full control of private repositories)
   - [ ] `workflow` (Update GitHub Action workflows)
3. Токен сохранен в GitHub Secrets как `PAT_TOKEN`

### 3. Sentry настроен
1. Auth Token создан: https://sentry.io/settings/account/api/auth-tokens/
2. Права:
   - [ ] `project:read`
   - [ ] `project:releases`
   - [ ] `project:write`
   - [ ] `org:read`
3. DSN скопирован из: https://sentry.io/settings/jemal-rm/projects/javascript-react/keys/

### 4. Repository Settings
1. Settings → Actions → General → Workflow permissions:
   - [ ] **Read and write permissions** ✅
   - [ ] **Allow GitHub Actions to create and approve pull requests** ✅

2. Settings → Rules → Rulesets:
   - [ ] Добавлен bypass для вашего аккаунта или
   - [ ] Repository Rules настроены правильно

### 5. Vercel Environment Variables
Откройте: https://vercel.com/dashboard → Project Settings → Environment Variables

Добавьте для **Production**:
- [ ] `SENTRY_AUTH_TOKEN`
- [ ] `SENTRY_DSN`
- [ ] `NODE_ENV=production`

### 6. Тестирование

Протестируйте workflow:

```bash
# 1. Создайте тестовую ветку
git checkout -b test/workflow-check dev

# 2. Сделайте минимальное изменение
echo "# Test" >> README.md
git add README.md
git commit -m "test: workflow check"
git push origin test/workflow-check

# 3. Создайте PR через GitHub UI
# 4. Добавьте label "patch"
# 5. Смержите PR
# 6. Проверьте Actions tab
```

### Ожидаемый результат:
- ✅ Workflow завершился успешно
- ✅ Версия увеличилась в package.json (commit в dev)
- ✅ Создан git tag
- ✅ Создан GitHub Release
- ✅ Создан релиз в Sentry
- ✅ Source maps загружены в Sentry

---

## 🐛 Если что-то не работает

### Проблема: workflow падает на "Create temporary branch"
**Решение**: Проверьте что PAT_TOKEN добавлен в secrets

### Проблема: workflow падает на "Merge version bump"
**Решение**: Repository Rules блокируют merge. Добавьте bypass в Settings → Rules

### Проблема: Sentry release не создается
**Решение**: 
1. Проверьте что SENTRY_AUTH_TOKEN добавлен в secrets
2. Проверьте что токен имеет правильные права
3. Workflow продолжит работу даже если Sentry упадет (`continue-on-error: true`)

### Проблема: GitHub Release не создается
**Решение**: Проверьте что PAT_TOKEN имеет права на repo

---

## 📞 Полезные ссылки

- GitHub Secrets: https://github.com/blnmstks/expensetracker/settings/secrets/actions
- GitHub Actions: https://github.com/blnmstks/expensetracker/actions
- Sentry Releases: https://sentry.io/organizations/jemal-rm/releases/
- Vercel Settings: https://vercel.com/dashboard
