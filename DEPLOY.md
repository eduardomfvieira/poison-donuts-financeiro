# 🚀 Guia de Deploy — Poison Donuts Financeiro

Este guia cobre o deploy completo: backend no Railway e frontend no Vercel.

---

## Parte 1 — Backend no Railway

### 1.1 Criar conta no Railway
Acesse [railway.app](https://railway.app) e faça login com o GitHub.

### 1.2 Criar novo projeto
1. Clique em **New Project**
2. Selecione **Deploy from GitHub repo**
3. Escolha o repositório `poison-donuts-financeiro`
4. Quando perguntar qual pasta, informe **`backend`**

### 1.3 Adicionar banco de dados PostgreSQL
1. Dentro do projeto, clique em **+ New**
2. Selecione **Database → PostgreSQL**
3. O Railway cria automaticamente e gera a variável `DATABASE_URL`

### 1.4 Configurar variáveis de ambiente
No serviço do backend, vá em **Variables** e adicione:

| Variável | Valor |
|---|---|
| `JWT_SECRET` | Uma string longa e aleatória (ex: `poison-donuts-2026-super-secret-key-abc123`) |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | A URL do Vercel (preencha depois do passo 2) |

> A `DATABASE_URL` já é adicionada automaticamente pelo PostgreSQL do Railway.

### 1.5 Configurar o diretório raiz
Em **Settings → Build**, defina:
- **Root Directory**: `backend`
- **Start Command**: `node server.js`

### 1.6 Deploy
Clique em **Deploy**. Em alguns minutos o backend estará no ar.
Copie a URL gerada (ex: `https://poison-donuts-backend-production.up.railway.app`).

---

## Parte 2 — Frontend no Vercel

### 2.1 Criar conta no Vercel
Acesse [vercel.com](https://vercel.com) e faça login com o GitHub.

### 2.2 Importar o projeto
1. Clique em **Add New → Project**
2. Selecione o repositório `poison-donuts-financeiro`
3. O Vercel detecta automaticamente que é Vite/React

### 2.3 Configurar variável de ambiente
Em **Environment Variables**, adicione:

| Variável | Valor |
|---|---|
| `VITE_API_URL` | A URL do backend do Railway (ex: `https://poison-donuts-backend-production.up.railway.app`) |

### 2.4 Deploy
Clique em **Deploy**. Em 1-2 minutos o frontend estará no ar com uma URL pública.

### 2.5 Atualizar CORS no Railway
Volte ao Railway, vá em **Variables** e atualize:
- `FRONTEND_URL` = URL do Vercel (ex: `https://poison-donuts.vercel.app`)

---

## Parte 3 — Primeiro acesso

1. Acesse a URL do Vercel
2. Clique em **Criar conta** e cadastre seu usuário (Eduardo)
3. Compartilhe a URL com sua equipe — cada pessoa cria sua própria conta
4. Todos os dados são compartilhados em tempo real no banco PostgreSQL

---

## Estrutura final

```
poison-donuts-financeiro/
├── src/                  ← Frontend React (Vercel)
│   ├── App.jsx
│   ├── api.js            ← Camada de comunicação com o backend
│   └── main.jsx
├── backend/              ← API Node.js (Railway)
│   ├── server.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── despesas.js
│   │   ├── contas.js
│   │   └── categorias.js
│   ├── middleware/auth.js
│   ├── db/schema.sql
│   └── .env.example
├── index.html
├── package.json
├── vite.config.js
└── .env.example          ← Preencha com a URL do backend
```

---

## Dúvidas frequentes

**Como adicionar um novo funcionário?**
Basta compartilhar a URL e ele cria uma conta. Todos veem os mesmos dados.

**Onde ficam os dados?**
No PostgreSQL hospedado no Railway. Ficam salvos permanentemente.

**Custa dinheiro?**
Railway tem um plano gratuito com $5/mês de crédito (suficiente para uso leve).
Vercel é gratuito para projetos pessoais.
