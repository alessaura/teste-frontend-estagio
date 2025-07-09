// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// export const authAPI = {
//   login: async (username: string, password: string) => {
//     const response = await fetch(`${API_BASE_URL}/auth/login`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ username, password })
//     });
//     return response.json();
//   },
  
//   register: async (userData: RegisterData) => {
//     const response = await fetch(`${API_BASE_URL}/auth/register`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(userData)
//     });
//     return response.json();
//   },
  
//   getProfile: async (token: string) => {
//     const response = await fetch(`${API_BASE_URL}/user/profile`, {
//       headers: { 'Authorization': `Bearer ${token}` }
//     });
//     return response.json();
//   }
// };