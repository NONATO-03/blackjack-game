# Push para GitHub - Passo a Passo

## ✅ Seu repositório já está pronto!

O repositório local está com:
- ✓ Branch `main` (produção)
- ✓ Branch `develop` (desenvolvimento)
- ✓ Branch `feature/initial-setup`
- ✓ Branch `release/v1.0.0`
- ✓ Branch `hotfix/critical-fixes`
- ✓ Commits de todo o projeto

---

## 🚀 Como fazer Push para GitHub

### Passo 1: Verificar configuração do git

```bash
git config --list
```

Se nada aparecer, configure:

```bash
git config user.email "seu@email.com"
git config user.name "Seu Nome"
```

### Passo 2: Adicionar remoto do GitHub

Se ainda não tiver adicionado:

```bash
git remote add origin https://github.com/NONATO-03/blackjack-game.git
```

Verificar:
```bash
git remote -v
```

### Passo 3: Fazer Push de Todas as Branches

```bash
# Push de main (com tag de versão se houver)
git push -u origin main

# Push de develop
git push -u origin develop

# Push de todas as branches
git push --all -u origin
```

Ou individualmente:

```bash
git push -u origin main
git push -u origin develop
git push -u origin feature/initial-setup
git push -u origin release/v1.0.0
git push -u origin hotfix/critical-fixes
```

### Passo 4: Verificar no GitHub

Acesse: https://github.com/NONATO-03/blackjack-game

Você deverá ver:
- ✓ Tab "Branches" com todas as branches
- ✓ Todos os commits
- ✓ Toda a estrutura do projeto

---

## 🔐 Autenticação (Git Credentials)

### Opção 1: HTTPS + Personal Access Token (Recomendado)

1. Gere um token no GitHub:
   - GitHub → Settings → Developer settings → Personal access tokens → Generate new token
   - Selecione `repo` scope
   - Copie o token

2. Ao fazer push:
   ```bash
   git push origin main
   # Será pedido username e password
   # Username: seu-username
   # Password: cole o token aqui
   ```

3. Windows guardará as credenciais automaticamente (Windows Credential Manager)

### Opção 2: SSH (Mais Seguro)

1. Gere chave SSH:
   ```bash
   ssh-keygen -t ed25519 -C "seu@email.com"
   ```

2. Adicione a chave pública no GitHub (Settings → SSH Keys)

3. Use URL SSH:
   ```bash
   git remote set-url origin git@github.com:NONATO-03/blackjack-game.git
   ```

---

## 🎯 Próximos Passos

### Após fazer Push:

1. **Configure Proteção de Branches** (GitHub > Settings > Branches):
   - Proteja `main` - exigir PR e reviews
   - Proteja `develop` - exigir testes passando

2. **Ative GitHub Actions** para CI/CD:
   - Testes automáticos
   - Linting
   - Deploy automático em release

3. **Configure Pages** (se quiser):
   - Settings > Pages
   - Deploy versão demo

---

## ❓ Problemas Comuns

### "fatal: 'origin' does not appear to be a 'git' repository"

Adicione o remoto:
```bash
git remote add origin https://github.com/NONATO-03/blackjack-game.git
```

### "Permission denied (publickey)"

Se usar SSH, verifique suas chaves SSH. Use HTTPS como alternativa.

### "remote rejected"

1. Verifique permissões no repositório GitHub
2. Tente fazer pull antes: `git pull origin main`
3. Sincronize: `git merge origin/main main`

---

## 📋 Comandos Rápidos

```bash
# Verificar status
git status

# Ver remoto
git remote -v

# Fazer push de branch atual
git push

# Fazer push de todas as branches
git push --all

# Trazer mudanças do GitHub
git pull

# Sincronizar fork com upstream
git fetch upstream && git merge upstream/main
```

---

**Você está pronto! 🚀**

Seu repositório local está totalmente configurado e pronto para sincronizar com GitHub.

Para mais detalhe, veja: [GITFLOW.md](GITFLOW.md)
