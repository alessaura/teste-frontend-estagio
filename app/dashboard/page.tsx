"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";

import { isAuthenticated, logout, getCurrentUser, User as UserType } from "@/lib/auth";

const Dashboard = () => {
  const { push } = useRouter();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      push("/");
    } else {
      // Carregar dados do usuário
      const user = getCurrentUser();
      setCurrentUser(user);
    }
  }, [push]);

  const handleLogout = () => {
    logout();
    push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                <span className="gradient-text from-secondary-purple to-primary-purple">
                  Capivara AI
                </span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <User size={20} />
                <span>
                  {currentUser ? `Olá, ${currentUser.username}` : "Usuário Logado"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-primary-purple transition-colors"
              >
                <LogOut size={20} />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {currentUser 
                ? `Bem-vindo, ${currentUser.username}!` 
                : "Bem-vindo ao Dashboard!"
              }
            </h2>
            <p className="text-gray-600 mb-4">
              Você está logado com sucesso. Esta é uma página de exemplo do
              dashboard.
            </p>
            
            {/* Seção de informações do usuário */}
            {currentUser && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">
                  Suas Informações
                </h3>
                <div className="space-y-2">
                  <p className="text-purple-700">
                    <strong>Usuário:</strong> {currentUser.username}
                  </p>
                  <p className="text-purple-700">
                    <strong>Email:</strong> {currentUser.email}
                  </p>
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-700">
                Sistema funcionando perfeitamente! 🚀
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;