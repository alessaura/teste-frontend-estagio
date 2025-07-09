interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Simular banco de dados em memória
let users: User[] = [
  {
    id: 1,
    username: "admin",
    email: "admin@example.com",
    created_at: new Date().toISOString()
  }
];

let currentUserId = 2;

// Simular delay de rede
const delay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    await delay();
    
    // Simular resposta baseada no endpoint
    console.log(`[MOCK API] ${options.method || 'GET'} ${endpoint}`);
    
    return {
      success: true,
      message: "Mock API response",
      data: {} as T
    };
  },

  auth: {
    register: async (userData: {
      username: string;
      email: string;
      password: string;
      confirm_password: string;
    }): Promise<ApiResponse> => {
      await delay();
      
      // Validações básicas
      if (userData.password !== userData.confirm_password) {
        return {
          success: false,
          message: "Senhas não coincidem",
          error: "password_mismatch"
        };
      }
      
      // Verificar se usuário já existe
      const existingUser = users.find(u => 
        u.username === userData.username || u.email === userData.email
      );
      
      if (existingUser) {
        return {
          success: false,
          message: "Usuário ou email já existe",
          error: "user_exists"
        };
      }
      
      // Criar novo usuário
      const newUser: User = {
        id: currentUserId++,
        username: userData.username,
        email: userData.email,
        created_at: new Date().toISOString()
      };
      
      users.push(newUser);
      
      return {
        success: true,
        message: "Usuário cadastrado com sucesso!",
        data: {
          user: newUser
        }
      };
    },
    
    login: async (credentials: {
      username: string;
      password: string;
      remember_me?: boolean;
    }): Promise<ApiResponse> => {
      await delay();
      
      // Verificar credenciais
      const user = users.find(u => u.username === credentials.username);
      
      if (!user) {
        return {
          success: false,
          message: "Usuário não encontrado",
          error: "user_not_found"
        };
      }
      
      // Simular verificação de senha (aceitar qualquer senha para demo)
      // Em produção real, verificaria hash da senha
      
      return {
        success: true,
        message: "Login realizado com sucesso!",
        data: {
          access_token: `mock-jwt-token-${user.id}-${Date.now()}`,
          refresh_token: `mock-refresh-token-${user.id}-${Date.now()}`,
          user: user
        }
      };
    },
    
    logout: async (token: string): Promise<ApiResponse> => {
      await delay(300);
      
      return {
        success: true,
        message: "Logout realizado com sucesso"
      };
    },

    refresh: async (refreshToken: string): Promise<ApiResponse> => {
      await delay(500);
      
      return {
        success: true,
        message: "Token renovado com sucesso",
        data: {
          access_token: `mock-jwt-token-refreshed-${Date.now()}`,
          refresh_token: `mock-refresh-token-refreshed-${Date.now()}`
        }
      };
    }
  },

  user: {
    getProfile: async (token: string): Promise<ApiResponse> => {
      await delay();
      
      // Extrair ID do token mock
      const tokenParts = token.split('-');
      const userId = tokenParts[3] || '1';
      
      const user = users.find(u => u.id.toString() === userId) || users[0];
      
      return {
        success: true,
        message: "Perfil obtido com sucesso",
        data: {
          user: user,
          preferences: {
            theme: "light",
            notifications: true,
            language: "pt-BR"
          },
          stats: {
            login_count: Math.floor(Math.random() * 50) + 1,
            last_login: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            account_age_days: Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))
          }
        }
      };
    },
    
    updateProfile: async (token: string, data: {
      username?: string;
      email?: string;
    }): Promise<ApiResponse> => {
      await delay();
      
      const tokenParts = token.split('-');
      const userId = tokenParts[3] || '1';
      
      const userIndex = users.findIndex(u => u.id.toString() === userId);
      
      if (userIndex === -1) {
        return {
          success: false,
          message: "Usuário não encontrado",
          error: "user_not_found"
        };
      }
      
      // Atualizar dados
      if (data.username) users[userIndex].username = data.username;
      if (data.email) users[userIndex].email = data.email;
      
      return {
        success: true,
        message: "Perfil atualizado com sucesso",
        data: {
          user: users[userIndex]
        }
      };
    },

    getPreferences: async (token: string): Promise<ApiResponse> => {
      await delay(400);
      
      return {
        success: true,
        message: "Preferências obtidas com sucesso",
        data: {
          theme: "light",
          notifications: true,
          language: "pt-BR",
          email_notifications: true,
          push_notifications: false
        }
      };
    },

    updatePreferences: async (token: string, preferences: any): Promise<ApiResponse> => {
      await delay(600);
      
      return {
        success: true,
        message: "Preferências atualizadas com sucesso",
        data: preferences
      };
    }
  },

  utils: {
    health: async (): Promise<ApiResponse> => {
      await delay(200);
      
      return {
        success: true,
        message: "API Mock funcionando perfeitamente",
        data: {
          status: "healthy",
          version: "1.0.0-mock",
          timestamp: new Date().toISOString(),
          environment: "mock"
        }
      };
    },

    info: async (): Promise<ApiResponse> => {
      await delay(300);
      
      return {
        success: true,
        message: "Informações da API Mock",
        data: {
          name: "Capivara AI Mock API",
          version: "1.0.0",
          description: "API simulada para demonstração",
          endpoints: 12,
          users_count: users.length,
          uptime: "100%"
        }
      };
    },

    stats: async (): Promise<ApiResponse> => {
      await delay(500);
      
      return {
        success: true,
        message: "Estatísticas da API Mock",
        data: {
          total_users: users.length,
          active_sessions: Math.floor(Math.random() * 10) + 1,
          total_requests: Math.floor(Math.random() * 1000) + 100,
          uptime_percentage: 99.9,
          response_time_avg: "245ms"
        }
      };
    }
  }
};

// Exportar tipos para compatibilidade
export type { ApiResponse };
