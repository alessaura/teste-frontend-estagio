# Capivara AI - Backend Flask Completo

## 🎯 **O que é este backend**

Backend Flask completo e pronto para integração com seu frontend Next.js. Inclui:

- ✅ **API REST completa** - 12 endpoints de autenticação e usuário
- ✅ **JWT Authentication** - Tokens com refresh
- ✅ **Banco SQLite/PostgreSQL** - Modelos completos
- ✅ **Validação rigorosa** - Marshmallow schemas
- ✅ **CORS configurado** - Pronto para frontend
- ✅ **Hash de senhas** - bcrypt + salt
- ✅ **Usuário admin** - Criado automaticamente

---

## 🚀 **Setup Rápido (5 minutos)**

```bash
# 1. Extrair ZIP na pasta do seu projeto
unzip capivara-ai-backend-completo.zip

# 2. Ir para pasta backend
cd capivara-ai-backend-completo

# 3. Criar ambiente virtual
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# 4. Instalar dependências
pip install -r requirements.txt

# 5. Executar
python src/main.py
```

**Pronto! Backend rodando em http://localhost:5000** 🎉

---

## 🧪 **Testar se Funciona**

```bash
# Health check
curl http://localhost:5000/api/utils/health

# Info da API
curl http://localhost:5000/api/utils/info

# Login com usuário admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 🔗 **Integrar com seu Frontend**

### **1. Criar arquivo de API no frontend:**

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = {
  auth: {
    register: async (userData: any) => {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return response.json();
    },
    
    login: async (username: string, password: string) => {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      return response.json();
    }
  },
  
  user: {
    getProfile: async (token: string) => {
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.json();
    }
  }
};
```

### **2. Atualizar lib/auth.ts:**

```typescript
// Substituir funções mockadas por chamadas reais
import { api } from './api';

export const registerUser = async (username: string, password: string, email: string) => {
  try {
    const result = await api.auth.register({
      username, email, password, confirm_password: password
    });
    return { success: result.success, message: result.message, user: result.user };
  } catch (error) {
    return { success: false, message: 'Erro de conexão' };
  }
};

export const loginUser = async (username: string, password: string) => {
  try {
    const result = await api.auth.login(username, password);
    if (result.success) {
      localStorage.setItem('access_token', result.access_token);
      localStorage.setItem('user_data', JSON.stringify(result.user));
    }
    return { success: result.success, message: result.message, user: result.user };
  } catch (error) {
    return { success: false, message: 'Erro de conexão' };
  }
};
```

### **3. Configurar variáveis de ambiente:**

```env
# .env.local (frontend)
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 📊 **Endpoints Disponíveis**

### **Autenticação:**
- `POST /api/auth/register` - Cadastro
- `POST /api/auth/login` - Login  
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Renovar token

### **Usuário:**
- `GET /api/user/profile` - Perfil completo
- `PUT /api/user/profile` - Atualizar perfil
- `GET /api/user/preferences` - Preferências
- `PUT /api/user/preferences` - Atualizar preferências

### **Utilitários:**
- `GET /api/utils/health` - Health check
- `GET /api/utils/info` - Info da API
- `GET /api/utils/stats` - Estatísticas

---

## ⚙️ **Configuração**

### **Desenvolvimento (.env):**
```env
FLASK_ENV=development
SECRET_KEY=capivara-ai-super-secret-key-2024
JWT_SECRET_KEY=jwt-secret-key-capivara-ai-2024
DATABASE_URL=sqlite:///app.db
CORS_ORIGINS=http://localhost:3000
PORT=5000
```

### **Produção (Railway):**
```env
FLASK_ENV=production
SECRET_KEY=sua-chave-super-secreta
JWT_SECRET_KEY=sua-jwt-chave-secreta
DATABASE_URL=postgresql://user:pass@host:port/db
CORS_ORIGINS=https://seu-frontend.vercel.app
PORT=5000
```

---

## 🚀 **Deploy no Railway**

### **1. Preparar para deploy:**
```bash
# Já está configurado! Apenas:
git add .
git commit -m "Add backend"
git push
```

### **2. No Railway:**
1. Conectar repositório
2. Selecionar pasta backend
3. Adicionar PostgreSQL
4. Configurar variáveis de ambiente
5. Deploy automático!

### **3. URLs finais:**
- Backend: `https://seu-backend.up.railway.app`
- Health: `https://seu-backend.up.railway.app/api/utils/health`

---

## 🔧 **Estrutura do Código**

```
src/
├── models/          # Modelos do banco
│   └── user.py      # User, UserSession, UserPreferences
├── routes/          # Rotas da API
│   ├── auth.py      # Autenticação
│   ├── user.py      # Operações de usuário
│   └── utils.py     # Utilitários
├── schemas/         # Validação
│   ├── auth_schemas.py
│   └── user_schemas.py
├── utils/           # Utilitários
│   └── auth_utils.py
└── main.py          # App principal
```

---

## 🧪 **Testes Incluídos**

```bash
# Executar testes
python test_api.py

# Deve mostrar:
# ✅ Health check
# ✅ Register user
# ✅ Login user
# ✅ Get profile
# ✅ Update profile
```

---

## 💡 **Próximos Passos**

1. **Testar backend** - `python src/main.py`
2. **Integrar frontend** - Usar códigos acima
3. **Testar integração** - Cadastro/login funcionando
4. **Deploy produção** - Railway + Vercel
5. **Atualizar URLs** - Documentação final

---

## 🆘 **Problemas Comuns**

### **CORS Error:**
```bash
# Verificar CORS_ORIGINS no .env
CORS_ORIGINS=http://localhost:3000
```

### **Banco não conecta:**
```bash
# Recriar banco
python -c "from src.main import app, db; app.app_context().push(); db.create_all()"
```

### **JWT não funciona:**
```bash
# Verificar JWT_SECRET_KEY no .env
JWT_SECRET_KEY=sua-chave-aqui
```

---

## 🎯 **Resultado Final**

Com este backend você terá:
- ✅ **API profissional** funcionando
- ✅ **Dados reais** no banco
- ✅ **Autenticação JWT** segura
- ✅ **Pronto para produção**
- ✅ **Integração simples** com frontend

**Tempo de integração: 30 minutos** ⚡

---

**🚀 Boa integração! Seu projeto vai ficar incrível!**

