"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, Settings } from "lucide-react";

import { isAuthenticated, logout, getCurrentUser, User as UserType } from "@/lib/auth";
import { useToast } from '@/contexts/ToastContext';
import Skeleton from '@/components/Skeleton';
import UserProfile from '@/components/UserProfile';
import ThemeToggle from '@/components/ThemeToggle';

const Dashboard = () => {
  const { push } = useRouter();
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'settings'>('overview');

  useEffect(() => {
    if (!isAuthenticated()) {
      push("/");
    } else {
      // Simular carregamento de dados
      setTimeout(() => {
        const user = getCurrentUser();
        setCurrentUser(user);
        setIsLoading(false);
        
        // Mostrar toast de boas-vindas apenas uma vez
        if (user && !sessionStorage.getItem('welcome_shown')) {
          showToast(`Bem-vindo ao dashboard, ${user.username}!`, "success");
          sessionStorage.setItem('welcome_shown', 'true');
        }
      }, 1500);
    }
  }, [push, showToast]);

  const handleLogout = () => {
    showToast("Logout realizado com sucesso!", "info", { duration: 2000 });
    setTimeout(() => {
      logout();
      sessionStorage.removeItem('welcome_shown');
      push("/");
    }, 1000);
  };

  const handleUpdateUser = (updatedUser: UserType) => {
    setCurrentUser(updatedUser);
    // Atualizar storage também
    const storage = localStorage.getItem("auth_token") ? localStorage : sessionStorage;
    storage.setItem("user_data", JSON.stringify({
      username: updatedUser.username,
      email: updatedUser.email
    }));
  };

  // Componente de Loading da Navbar
  const NavbarSkeleton = () => (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton variant="circular" className="w-8 h-8" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>
    </nav>
  );

  // Componente de Loading do Conteúdo
  const ContentSkeleton = () => (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-full mb-4" />
          
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-4">
            <Skeleton className="h-6 w-48 mb-3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
    </main>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <NavbarSkeleton />
        <ContentSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                <span className="gradient-text from-secondary-purple to-primary-purple">
                  Capivara AI
                </span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Toggle de tema */}
              <ThemeToggle variant="button" />
              
              {/* Informações do usuário */}
              <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <User size={20} />
                <span>
                  {currentUser ? `Olá, ${currentUser.username}` : "Usuário Logado"}
                </span>
              </div>
              
              {/* Botão de logout */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-purple dark:hover:text-primary-purple transition-colors"
              >
                <LogOut size={20} />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tabs de navegação */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-primary-purple text-primary-purple'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'profile'
                  ? 'border-primary-purple text-primary-purple'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Meu Perfil
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'settings'
                  ? 'border-primary-purple text-primary-purple'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Configurações
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {currentUser 
                    ? `Bem-vindo, ${currentUser.username}!` 
                    : "Bem-vindo ao Dashboard!"
                  }
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Você está logado com sucesso. Esta é uma página de exemplo do dashboard.
                </p>
                
                {/* Seção de informações do usuário */}
                {currentUser && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                      Suas Informações
                    </h3>
                    <div className="space-y-2">
                      <p className="text-purple-700 dark:text-purple-300">
                        <strong>Usuário:</strong> {currentUser.username}
                      </p>
                      <p className="text-purple-700 dark:text-purple-300">
                        <strong>Email:</strong> {currentUser.email}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-blue-700 dark:text-blue-300">
                    Sistema funcionando perfeitamente! 🚀
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && currentUser && (
            <UserProfile 
              user={currentUser} 
              onUpdateUser={handleUpdateUser}
            />
          )}

          {activeTab === 'settings' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Settings size={24} className="mr-3 text-primary-purple" />
                Configurações
              </h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Aparência
                  </h4>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Tema</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Escolha entre tema claro ou escuro
                      </p>
                    </div>
                    <ThemeToggle variant="dropdown" showLabel />
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Notificações
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Notificações por email</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Receber atualizações por email
                        </p>
                      </div>
                      <input 
                        type="checkbox" 
                        defaultChecked 
                        className="h-4 w-4 text-primary-purple focus:ring-primary-purple border-gray-300 rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Notificações push</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Receber notificações no navegador
                        </p>
                      </div>
                      <input 
                        type="checkbox" 
                        defaultChecked 
                        className="h-4 w-4 text-primary-purple focus:ring-primary-purple border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;