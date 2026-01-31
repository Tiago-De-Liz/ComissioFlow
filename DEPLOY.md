# Deploy do ComissioFlow

## Arquitetura de Deploy Recomendada

| Serviço | Plataforma | Free Tier |
|---------|------------|-----------|
| Frontend | Vercel | ✅ Sim |
| Backend | Railway | ✅ $5/mês grátis |
| Banco de Dados | Neon | ✅ Sim |

---

## 1. Banco de Dados (Neon)

### Criar conta e banco:
1. Acesse https://neon.tech e crie uma conta
2. Crie um novo projeto (ex: "comissioflow")
3. Copie a connection string que será algo como:
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

### Extrair variáveis da connection string:
- `DB_HOST`: ep-xxx.region.aws.neon.tech
- `DB_PORT`: 5432
- `DB_USER`: user
- `DB_PASSWORD`: password
- `DB_DATABASE`: neondb

---

## 2. Backend (Railway)

### Deploy:
1. Acesse https://railway.app e faça login com GitHub
2. Clique em "New Project" → "Deploy from GitHub repo"
3. Selecione seu repositório
4. **Configure Root Directory**: `apps/backend`

### Variáveis de ambiente (Settings → Variables):
```
NODE_ENV=production
PORT=3333
HOST=0.0.0.0
LOG_LEVEL=info
APP_KEY=<gere uma string aleatória de 32 caracteres>
FRONTEND_URL=https://seu-app.vercel.app
DB_HOST=<do Neon>
DB_PORT=5432
DB_USER=<do Neon>
DB_PASSWORD=<do Neon>
DB_DATABASE=<do Neon>
SESSION_DRIVER=cookie
LIMITER_STORE=memory
TZ=America/Sao_Paulo
```

### Gerar APP_KEY:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Após deploy, rodar migrations:
No Railway, vá em Settings → Deploy → Custom Start Command:
```
node ace migration:run --force && node bin/server.js
```

### Anote a URL do backend:
Será algo como: `https://comissioflow-backend.up.railway.app`

---

## 3. Frontend (Vercel)

### Deploy:
1. Acesse https://vercel.com e faça login com GitHub
2. Clique em "Add New Project"
3. Importe seu repositório
4. **Configure Root Directory**: `apps/frontend`
5. Framework Preset: Vite
6. Build Command: `npm run build`
7. Output Directory: `dist`

### Variáveis de ambiente:
```
VITE_API_URL=https://sua-url-railway.up.railway.app
```

---

## 4. Após Deploy

### Testar:
1. Acesse a URL do frontend na Vercel
2. Registre uma nova empresa
3. Faça login e teste as funcionalidades

### Atualizar CORS no backend:
Depois de saber a URL do frontend na Vercel, atualize a variável `FRONTEND_URL` no Railway.

---

## Alternativa: Render

Se preferir usar Render ao invés de Railway:

1. Acesse https://render.com
2. New → Web Service
3. Conecte seu repositório
4. Root Directory: `apps/backend`
5. Build Command: `npm install && npm run build`
6. Start Command: `node ace migration:run --force && node bin/server.js`

---

## Troubleshooting

### Erro de CORS:
Verifique se `FRONTEND_URL` está correto no backend.

### Erro de conexão com banco:
Verifique se as credenciais do Neon estão corretas e se o SSL está habilitado.

### Cookies não funcionam:
Certifique-se que:
- O backend usa HTTPS
- `SESSION_DRIVER=cookie`
- `sameSite` está como `none` em produção

### Migrations não rodam:
Execute manualmente no Railway:
```bash
node ace migration:run --force
```
