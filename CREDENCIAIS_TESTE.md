# 🔑 Credenciais de Teste - ComissioFlow

Após rodar `node ace migration:fresh --seed`, você terá os seguintes usuários disponíveis:

---

## 👤 Usuário Admin (Sem Employee)

**Email:** admin@comissioflow.com
**Senha:** Admin@123
**Tipo:** Usuário normal (não vinculado a nenhum employee)
**Acesso:** Total ao sistema

---

## 👨‍💼 Pedro Henrique (Vendedor Sênior)

**Email:** pedro@comissioflow.com
**Senha:** Pedro@123
**CPF:** 345.678.901-22
**Cargo:** Vendedor Sênior
**Status:** Ativo
**Acesso:** ✅ Vinculado a Employee e Seller

**Funcionalidades:**
- Login normal (senha já trocada)
- Auto-preenchimento de vendedor ao criar venda
- Visualizar comissões

---

## 👩‍💼 Julia Martins (Vendedora Júnior) - TROCA DE SENHA OBRIGATÓRIA

**Email:** julia@comissioflow.com
**Senha Temporária:** Temp@123
**CPF:** 456.789.012-33
**Cargo:** Vendedor Júnior
**Status:** Ativo
**Acesso:** ⚠️ Senha temporária - **Deve trocar no primeiro login**

**Funcionalidades:**
- Ao fazer login, será **redirecionado automaticamente** para troca de senha
- Não consegue acessar o sistema até trocar a senha
- Testa o fluxo de `mustChangePassword = true`

**Nova senha deve ter:**
- Mínimo 8 caracteres
- 1 letra maiúscula
- 1 letra minúscula
- 1 número

---

## 📋 Employees SEM Acesso ao Sistema

Estes employees **NÃO** têm usuários vinculados (demonstrando que é opcional):

### Carlos Eduardo (CEO)
- **CPF:** 123.456.789-00
- **Cargo:** CEO
- **Status:** Ativo
- **Acesso:** ❌ Sem conta de usuário

### Ana Paula (Gerente de Vendas)
- **CPF:** 234.567.890-11
- **Cargo:** Gerente de Vendas
- **Status:** Ativo
- **Acesso:** ❌ Sem conta de usuário

### Lucas Oliveira (Vendedor Júnior)
- **CPF:** 567.890.123-44
- **Cargo:** Vendedor Júnior
- **Status:** ⚠️ Inativo
- **Acesso:** ❌ Sem conta de usuário

---

## 🧪 Cenários de Teste

### 1. Login Normal
```
Email: pedro@comissioflow.com
Senha: Pedro@123
✅ Login direto, sem troca de senha
```

### 2. Primeiro Login com Senha Temporária
```
Email: julia@comissioflow.com
Senha: Temp@123
⚠️ Será redirecionado para trocar senha
```

### 3. Rate Limiting
```
Faça 6 tentativas de login com senha errada
❌ 5ª tentativa: Bloqueado por 15 minutos
```

### 4. Validação de Senha Fraca
```
Tente registrar com senha: senha123
❌ Erro: Senha deve ter maiúscula, minúscula e número
```

### 5. Auto-preenchimento de Seller
```
1. Login como pedro@comissioflow.com
2. Ir em "Vendas" > "Nova Venda"
✅ Vendedor "Pedro Henrique" já vem selecionado
```

### 6. Criar Employee com Acesso
```
1. Login como admin
2. Ir em "Funcionários" > "Novo Funcionário"
3. Marcar checkbox "Criar acesso ao sistema"
4. Preencher email e senha temporária
✅ Funcionário criado + User criado + mustChangePassword = true
```

---

## 🔧 Comandos Úteis

### Resetar banco de dados com seeders
```bash
cd apps/backend
node ace migration:fresh --seed
```

### Verificar usuários no banco
```bash
node ace tinker
> await User.all()
```

### Verificar employees com users
```bash
node ace tinker
> await Employee.query().preload('user').exec()
```

---

## 📊 Estrutura de Dados de Teste

| Nome | Email | Senha | Employee? | Seller? | must_change_password |
|------|-------|-------|-----------|---------|---------------------|
| Admin User | admin@comissioflow.com | Admin@123 | ❌ | ❌ | ❌ |
| Pedro Henrique | pedro@comissioflow.com | Pedro@123 | ✅ | ✅ | ❌ |
| Julia Martins | julia@comissioflow.com | Temp@123 | ✅ | ✅ | ✅ |
| Carlos Eduardo | - | - | ✅ | ❌ | - |
| Ana Paula | - | - | ✅ | ❌ | - |
| Lucas Oliveira | - | - | ✅ (Inativo) | ✅ | - |

---

## ⚡ Dicas

1. **Para testar troca de senha:** Use julia@comissioflow.com
2. **Para testar auto-preenchimento:** Use pedro@comissioflow.com
3. **Para testar criação de employee+user:** Use admin@comissioflow.com
4. **Para testar validação de CPF:** Tente criar employee com CPF inválido (ex: 111.111.111-11)
5. **Para testar rate limiting:** Erre a senha 6 vezes seguidas

---

🎯 **Todos os cenários de segurança e UX implementados estão prontos para teste!**
