const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export const api = {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Erro na requisição',
          error: data.error || 'Unknown error'
        };
      }

      return {
        success: true,
        message: data.message || 'Sucesso',
        data: data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro de conexão com o servidor',
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  },

  // Autenticação
  auth: {
    register: (userData: any) => 
      api.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      }),
    
    login: (credentials: any) => 
      api.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }),
    
    logout: (token: string) => 
      api.request('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }),
  },

  // Usuário
  user: {
    getProfile: (token: string) => 
      api.request('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      }),
    
    updateProfile: (token: string, data: any) => 
      api.request('/api/user/profile', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data)
      }),
  }
};