import { api as realApi } from './api';
import { api as mockApi } from './api-mock';

// Interfaces para tipagem
interface User {
  id: number;
  username: string;
  email: string;
  created_at?: string;
}

// Usar API real em desenvolvimento, mock em produção
const api = process.env.NODE_ENV === 'production' ? mockApi : realApi;

// Log para debug
console.log(`[AUTH] Usando ${process.env.NODE_ENV === 'production' ? 'MOCK' : 'REAL'} API`);

// Substituir registerUser existente
export const registerUser = async (username: string, password: string, email: string) => {
  try {
    const result: any = await api.auth.register({
      username,
      email,
      password,
      confirm_password: password
    });
    
    if (result.success && result.data) {
      return { 
        success: true, 
        message: result.message || 'Usuário cadastrado com sucesso',
        user: result.data.user 
      };
    } else {
      return { 
        success: false, 
        message: result.message || 'Erro no cadastro' 
      };
    }
  } catch (error) {
    console.error('[AUTH] Erro no registro:', error);
    return { 
      success: false, 
      message: 'Erro de conexão com o servidor' 
    };
  }
};

// Substituir loginUser existente
export const loginUser = async (username: string, password: string, rememberMe = false) => {
  try {
    const result: any = await api.auth.login({
      username,
      password,
      remember_me: rememberMe
    });
    
    if (result.success && result.data) {
      // Salvar token e dados do usuário
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('access_token', result.data.access_token);
      storage.setItem('user_data', JSON.stringify(result.data.user));
      
      console.log('[AUTH] Login bem-sucedido:', result.data.user.username);
      
      return { 
        success: true, 
        message: result.message || 'Login realizado com sucesso',
        user: result.data.user 
      };
    } else {
      console.log('[AUTH] Login falhou:', result.message);
      return { 
        success: false, 
        message: result.message || 'Credenciais inválidas' 
      };
    }
  } catch (error) {
    console.error('[AUTH] Erro no login:', error);
    return { 
      success: false, 
      message: 'Erro de conexão com o servidor' 
    };
  }
};

// Função para obter token
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem('access_token') || 
         sessionStorage.getItem('access_token');
};

// Função para obter dados do usuário
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const userData = localStorage.getItem('user_data') || 
                   sessionStorage.getItem('user_data');
  
  return userData ? JSON.parse(userData) as User : null;
};

// Atualizar isAuthenticated
export const isAuthenticated = (): boolean => {
  const token = getToken();
  const user = getCurrentUser();
  
  console.log('[AUTH] Verificando autenticação:', { 
    hasToken: !!token, 
    hasUser: !!user,
    username: user?.username 
  });
  
  return !!(token && user);
};

// Atualizar logout
export const logout = async () => {
  const token = getToken();
  
  if (token) {
    try {
      await api.auth.logout(token);
      console.log('[AUTH] Logout realizado via API');
    } catch (error) {
      console.error('[AUTH] Erro no logout via API:', error);
    }
  }
  
  // Limpar storage
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_data');
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('user_data');
  
  console.log('[AUTH] Storage limpo');
};

// Função para obter perfil completo (nova)
export const getUserProfile = async () => {
  const token = getToken();
  
  if (!token) {
    return { success: false, message: 'Token não encontrado' };
  }
  
  try {
    const result: any = await api.user.getProfile(token);
    
    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    } else {
      return {
        success: false,
        message: result.message || 'Erro ao obter perfil'
      };
    }
  } catch (error) {
    console.error('[AUTH] Erro ao obter perfil:', error);
    return {
      success: false,
      message: 'Erro de conexão'
    };
  }
};

// Função para atualizar perfil (nova)
export const updateUserProfile = async (data: { username?: string; email?: string }) => {
  const token = getToken();
  
  if (!token) {
    return { success: false, message: 'Token não encontrado' };
  }
  
  try {
    const result: any = await api.user.updateProfile(token, data);
    
    if (result.success && result.data) {
      // Atualizar dados locais
      const storage = localStorage.getItem('user_data') ? localStorage : sessionStorage;
      storage.setItem('user_data', JSON.stringify(result.data.user));
      
      return {
        success: true,
        message: result.message,
        user: result.data.user
      };
    } else {
      return {
        success: false,
        message: result.message || 'Erro ao atualizar perfil'
      };
    }
  } catch (error) {
    console.error('[AUTH] Erro ao atualizar perfil:', error);
    return {
      success: false,
      message: 'Erro de conexão'
    };
  }
};

// Manter funções existentes que não foram alteradas (para compatibilidade)
export const users: Array<{ username: string; password: string; email: string }> = [
  { username: "admin", password: "admin123", email: "admin@example.com" }
];

// Função para obter usuário por username (para compatibilidade)
export const getUserByUsername = (username: string) => {
  return users.find(user => user.username === username);
};

// Exportar tipos para uso em outros arquivos
export type { User };