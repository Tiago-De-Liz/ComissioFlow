# ComissioFlow

Sistema de gestão de comissões de vendas com cálculo automático baseado em regras de negócio e hierarquia organizacional.

## 📋 Sobre o Projeto

ComissioFlow é um sistema SaaS multi-tenant desenvolvido para automatizar o cálculo de comissões de vendedores e gerentes. O sistema implementa regras de negócio complexas baseadas em hierarquia de posições, onde tanto o vendedor quanto seu gerente recebem comissões calculadas automaticamente.

### Origem

Este projeto foi desenvolvido como desafio técnico, migrando uma lógica de negócio existente de **Visual FoxPro 9** para uma stack moderna (TypeScript + React + PostgreSQL), mantendo 100% de compatibilidade com as regras originais.

## 🎯 Funcionalidades Principais

### Gestão Multi-Tenant
- ✅ Cada empresa tem seus dados completamente isolados
- ✅ Registro self-service de novas empresas
- ✅ Validação de CNPJ e dados da empresa

### Gestão de Funcionários
- ✅ CRUD completo de funcionários
- ✅ Vinculação com posições hierárquicas
- ✅ Controle de status (ativo/inativo)
- ✅ Validação de CPF
- ✅ Criação opcional de acesso ao sistema

### Hierarquia Organizacional
- ✅ Estrutura hierárquica de posições (CEO → Gerente → Vendedor)
- ✅ Visualização em árvore da hierarquia
- ✅ Navegação entre níveis hierárquicos

### Gestão de Vendedores
- ✅ Configuração de regras de comissão por vendedor
- ✅ Valor fixo por venda
- ✅ Percentual sobre o valor da venda
- ✅ Vinculação com funcionários

### Registro de Vendas
- ✅ Registro de vendas com múltiplos itens
- ✅ Cálculo automático de comissões no momento da venda
- ✅ Armazenamento de snapshot das comissões (histórico imutável)
- ✅ Visualização detalhada de comissões por venda

### Relatórios de Comissões
- ✅ Relatório consolidado por período
- ✅ Filtro por vendedor
- ✅ Exportação em PDF
- ✅ Totalizadores (vendedor + gerente)

## 🏗️ Arquitetura e Decisões Técnicas

### Stack Tecnológica

**Backend:**
- **AdonisJS v6** - Framework Node.js com TypeScript
- **PostgreSQL** - Banco de dados relacional
- **Lucid ORM** - ORM nativo do AdonisJS
- **VineJS** - Validação de dados

**Frontend:**
- **React 19** - Biblioteca UI
- **TypeScript** - Type safety
- **React Router v7** - Roteamento
- **React Hot Toast** - Notificações

### Decisões Arquiteturais

#### 1. Multi-Tenancy por Coluna
Optamos por multi-tenancy através de `company_id` em todas as tabelas ao invés de schemas separados:
- ✅ Mais simples de implementar e manter
- ✅ Melhor performance para empresas com poucos dados
- ✅ Facilita queries agregadas para analytics futuras
- ✅ Migrations e seeders mais simples

#### 2. Snapshot de Comissões
As comissões são **calculadas e gravadas** no momento da venda (não em tempo real):
- ✅ Garante que mudanças futuras nas regras não afetam vendas passadas
- ✅ Auditoria completa de como cada comissão foi calculada
- ✅ Performance - sem necessidade de recalcular histórico
- ✅ **100% compatível com o sistema VFP9 original**

#### 3. Hierarquia via Parent Pointer
Estrutura de hierarquia usando `parent_position_id`:
- ✅ Simples de implementar e consultar
- ✅ Suporta hierarquias de profundidade arbitrária
- ✅ Fácil navegação bottom-up (vendedor → gerente)

#### 4. UUIDs como Primary Keys
Uso de UUIDs ao invés de IDs sequenciais:
- ✅ Segurança - não expõe quantidade de registros
- ✅ Não há colisão entre empresas
- ✅ Permite geração distribuída de IDs

## 📊 Modelo de Dados

```
companies (Empresas)
  └── users (Usuários)
  └── positions (Posições)
      └── employees (Funcionários)
          └── sellers (Vendedores)
              └── sales (Vendas)
                  └── sale_items (Itens + Comissões)
```

### Regra de Negócio - Cálculo de Comissão

Para cada item de venda:

**Comissão do Vendedor:**
```
comissão_vendedor = valor_fixo + (valor_item × percentual_vendedor / 100)
```

**Comissão do Gerente:**
```
comissão_gerente = valor_fixo_gerente + (valor_item × percentual_gerente / 100)
```

O gerente é identificado automaticamente através da hierarquia de posições.

## 🚀 Como Executar Localmente

### Pré-requisitos

- Node.js 20+
- PostgreSQL 14+
- pnpm (gerenciador de pacotes)

### 1. Clone o Repositório

```bash
git clone <url-do-repositorio>
cd ComissioFlow
```

### 2. Instale as Dependências

```bash
pnpm install
```

### 3. Configure o Backend

```bash
cd apps/backend
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações do PostgreSQL:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_DATABASE=comissioflow
```

### 4. Execute as Migrations e Seeders

```bash
# Rodar migrations (criar tabelas)
node ace migration:run

# Popular banco com dados de exemplo
node ace db:seed
```

### 5. Inicie os Servidores

**Backend (Terminal 1):**
```bash
cd apps/backend
pnpm dev
```
Backend rodará em: `http://localhost:3333`

**Frontend (Terminal 2):**
```bash
cd apps/frontend
pnpm dev
```
Frontend rodará em: `http://localhost:5173`

## 🧪 Testando o Sistema

### Credenciais de Teste

Após rodar os seeders, você pode fazer login com:

**Usuário Admin:**
- Email: `admin@comissioflow.com`
- Senha: `Admin@123`

**Usuário Gerente:**
- Email: `pedro@comissioflow.com`
- Senha: `Pedro@123`

**Usuário Vendedor:**
- Email: `julia@comissioflow.com`
- Senha: `Temp@123`

### Testando Multi-Tenancy

1. Acesse `http://localhost:5173/register`
2. Crie uma nova empresa com seus dados
3. Faça login com a nova empresa
4. Verifique que os dados da empresa anterior não aparecem

### Testando Cálculo de Comissões

1. Acesse "Vendas" → "Nova Venda"
2. Selecione um vendedor
3. Adicione itens com valores
4. Ao salvar, clique em "Ver Comissões"
5. Verifique que as comissões foram calculadas corretamente

**Exemplo de Cálculo:**
- Vendedor: Carlos Silva (Fixo: R$ 50,00 | Percentual: 3%)
- Venda: R$ 5.000,00
- Comissão Vendedor: R$ 50,00 + (R$ 5.000,00 × 3%) = **R$ 200,00**
- Comissão Gerente: R$ 100,00 + (R$ 5.000,00 × 5%) = **R$ 350,00**

## 📁 Estrutura do Projeto

```
ComissioFlow/
├── apps/
│   ├── backend/              # API AdonisJS
│   │   ├── app/
│   │   │   ├── controllers/  # Lógica de endpoints
│   │   │   ├── models/       # Models Lucid ORM
│   │   │   ├── services/     # Lógica de negócio
│   │   │   └── validators/   # Validações VineJS
│   │   ├── database/
│   │   │   ├── migrations/   # Schema do banco
│   │   │   └── seeders/      # Dados de exemplo
│   │   └── start/
│   │       └── routes.ts     # Definição de rotas
│   │
│   └── frontend/             # UI React
│       ├── src/
│       │   ├── components/   # Componentes reutilizáveis
│       │   ├── contexts/     # Context API (Auth)
│       │   ├── pages/        # Páginas da aplicação
│       │   └── types/        # TypeScript types
│       └── public/
│
├── README.md                 # Este arquivo
├── package.json              # Workspace root
└── pnpm-workspace.yaml       # Configuração monorepo
```

## 🔒 Segurança

- ✅ Autenticação baseada em sessão (cookies HTTP-only)
- ✅ Validação de entrada em todos os endpoints
- ✅ Isolamento de dados por empresa (multi-tenant)
- ✅ Rate limiting nas rotas de autenticação
- ✅ Senhas hasheadas com bcrypt
- ✅ Proteção CSRF
- ✅ Validação de CPF e CNPJ

## 🌐 Deploy em Produção

### Acesso Online

- **Aplicação:** https://comissioflow.vercel.app
- **API:** https://comissioflow-backend.up.railway.app

### Stack de Deploy

| Serviço | Plataforma |
|---------|------------|
| Frontend | Vercel |
| Backend | Railway |
| Banco de Dados | Neon (PostgreSQL) |

### Guia de Deploy

Para fazer seu próprio deploy, consulte o arquivo [DEPLOY.md](DEPLOY.md) com instruções detalhadas.

### Variáveis de Ambiente

**Backend (Railway):**
```env
NODE_ENV=production
HOST=0.0.0.0
FRONTEND_URL=<url-do-frontend-vercel>
DB_HOST=<host-do-neon>
DB_PORT=5432
DB_USER=<user-do-neon>
DB_PASSWORD=<password-do-neon>
DB_DATABASE=<database-do-neon>
SESSION_DRIVER=cookie
LIMITER_STORE=memory
```

**Frontend (Vercel):**
```env
VITE_API_URL=<url-do-backend-railway>
```

## 📝 Scripts Disponíveis

### Backend

```bash
pnpm dev                        # Inicia em modo desenvolvimento
pnpm build                      # Build para produção
node ace migration:run          # Roda migrations
node ace migration:rollback     # Reverte migrations
node ace db:seed                # Popula banco com dados
node ace list:routes            # Lista todas as rotas
```

### Frontend

```bash
pnpm dev              # Inicia em modo desenvolvimento
pnpm build            # Build para produção
pnpm preview          # Preview do build
```

## 📄 Licença

Este projeto foi desenvolvido como desafio técnico e é apenas para fins de demonstração.

## 👤 Autor

Desenvolvido como parte de um processo seletivo técnico.

---

**Tecnologias:** TypeScript, React, AdonisJS, PostgreSQL
**Padrões:** REST API, Multi-Tenant SaaS, Domain-Driven Design