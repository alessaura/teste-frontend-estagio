// Credentials data
const credentials = {
  users: [
    {
      username: "admin",
      password: "admin123",
      email: "admin@example.com",
    },
    {
      username: "user",
      password: "user123",
      email: "user@example.com",
    },
    {
      username: "teste",
      password: "teste123",
      email: "teste@example.com",
    },
  ],
};

export interface User {
  username: string;
  password: string;
  email: string;
}

export const authenticateUser = async (
  username: string,
  password: string
): Promise<{ success: boolean; user?: User }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const user = credentials.users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    return { success: true, user };
  }
  
  return { success: false };
};

export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("auth_token");
};

export const login = (token: string, user: User): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("auth_token", token);
  localStorage.setItem("user_data", JSON.stringify({
    username: user.username,
    email: user.email
  }));
};

export const logout = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user_data");
};


export const registerUser = async (
  username: string,
  password: string,
  email: string
): Promise<{ success: boolean; message: string }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Check if user already exists
  const existingUser = credentials.users.find(
    (u) => u.username === username || u.email === email
  );
  
  if (existingUser) {
    return { 
      success: false, 
      message: "Usuário ou email já existe" 
    };
  }

  // Add new user to the array (in production would save to database)
  const newUser: User = {
    username,
    password,
    email
  };
  
  credentials.users.push(newUser);

  return { 
    success: true, 
    message: "Usuário cadastrado com sucesso" 
  };
};

// ADICIONAR ao lib/auth.ts

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null;
  
  const token = localStorage.getItem("auth_token");
  if (!token) return null;
  
  // Recuperar dados do usuário do localStorage
  const userData = localStorage.getItem("user_data");
  if (!userData) return null;
  
  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
};

export const getUserByCredentials = (username: string, password: string): User | null => {
  return credentials.users.find(
    (u) => u.username === username && u.password === password
  ) || null;
};
