import { api } from './api';

interface User {
  id: number;
  username: string;
  email: string;
  created_at?: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  access_token: string;
  refresh_token?: string;
  user: User;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  user: User;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}


export const registerUser = async (username: string, password: string, email: string) => {
  try {
    const result = await api.auth.register({
      username,
      email,
      password,
      confirm_password: password
    }) as ApiResponse<RegisterResponse>;
    
    if (result.success && result.data) {
      return { 
        success: true, 
        message: result.data.message || 'Usuário cadastrado com sucesso',
        user: result.data.user 
      };
    } else {
      return { 
        success: false, 
        message: result.message || 'Erro no cadastro' 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      message: 'Erro de conexão com o servidor' 
    };
  }
};


export const loginUser = async (username: string, password: string, rememberMe = false) => {
  try {
    const result = await api.auth.login({
      username,
      password,
      remember_me: rememberMe
    }) as ApiResponse<LoginResponse>;
    
    if (result.success && result.data) {
     
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('access_token', result.data.access_token);
      storage.setItem('user_data', JSON.stringify(result.data.user));
      
      return { 
        success: true, 
        message: result.data.message || 'Login realizado com sucesso',
        user: result.data.user 
      };
    } else {
      return { 
        success: false, 
        message: result.message || 'Credenciais inválidas' 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      message: 'Erro de conexão com o servidor' 
    };
  }
};

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem('access_token') || 
         sessionStorage.getItem('access_token');
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const userData = localStorage.getItem('user_data') || 
                   sessionStorage.getItem('user_data');
  
  return userData ? JSON.parse(userData) as User : null;
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};


export const logout = async () => {
  const token = getToken();
  
  if (token) {
    try {
      await api.auth.logout(token);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  }

  localStorage.removeItem('access_token');
  localStorage.removeItem('user_data');
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('user_data');
};

export const users: Array<{ username: string; password: string; email: string }> = [
  { username: "admin", password: "admin123", email: "admin@example.com" }
];


export const getUserByUsername = (username: string) => {
  return users.find(user => user.username === username);
};

export type { User, LoginResponse, RegisterResponse, ApiResponse };

