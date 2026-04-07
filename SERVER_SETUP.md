# Como Rodar o Blackjack Game Localmente

## ⚠️ Problema Identificado

O projeto usa **ES Modules** que não funcionam com `file://` protocol do navegador. Você **precisa de um servidor HTTP local**.

## ✅ IMPORTANTE: NÃO PRECISA DE ADMIN!

- ✓ Porta 8000 não requer permissões administrativas
- ✓ Python e Node.js não precisam de admin para rodar
- ✓ Qualquer pessoa pode executar um servidor local

## 🚀 SOLUÇÃO MAIS RÁPIDA (Windows)

```bash
# Simplesmente execute:
run-server.bat
```

Este script detecta Python ou Node.js e inicia o servidor automaticamente.

---

## 3️⃣ Opções de Execução Manual

### Opção 1: Python (Recomendado - Mais Simples)

```bash
# Abra um terminal na pasta do projeto
cd public
python -m http.server 8000
```

**Depois acesse:** http://localhost:8000

**Requisito:** Python (instale do Microsoft Store ou python.org)

---

### Opção 2: Node.js

```bash
# Abra um terminal na pasta do projeto
npx http-server public -p 8000
```

**Depois acesse:** http://localhost:8000

**Requisito:** Node.js (nodejs.org)

---

### Opção 3: VS Code Live Server Extension

1. Abra VS Code
2. Instale a extensão "Live Server" (by Ritwick Dey)
3. Clique direito em `public/index.html`
4. Selecione "Open with Live Server"

---

### Opção 4: Linux/Mac

```bash
# Com Python 3
python -m http.server 8000

# Ou com Python 2
python -m SimpleHTTPServer 8000
```

---

## 🎮 Pronto!

Após iniciar o servidor, acesse **http://localhost:8000** no navegador.

---

## 📋 Status Atual

- ✅ Monitor shell removido (design mais limpo)
- ✅ Efeitos CRT preservados (scanlines, glow phosphor)
- ✅ Detecção automática de protocolo (file:// vs http://)
- ✅ Mensagens de erro claras e em português
- ⏳ Aguardando servidor HTTP para teste completo

---

## ❓ Dúvidas Frequentes

**P: Preciso de direitos de admin?**  
R: Não! A porta 8000 está aberta para usuários normais.

**P: Qual Python devo usar?**  
R: Python 3 é ideal. Instale do Microsoft Store (mais rápido) ou python.org

**P: Live Server é mais leve que Python?**  
R: Sim, mas Python é mais universal. Escolha conforme sua preferência.

**P: Posso usar outra porta?**  
R: Sim! Substitua `8000` pela porta desejada em qualquer comando acima.
