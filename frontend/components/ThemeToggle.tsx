"use client";
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useState } from 'react';

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown';
  showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  variant = 'button', 
  showLabel = false 
}) => {
  const { theme, toggleTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Selecionar tema"
        >
          {theme === 'light' ? (
            <Sun size={20} className="text-yellow-500" />
          ) : (
            <Moon size={20} className="text-blue-400" />
          )}
          {showLabel && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {theme === 'light' ? 'Claro' : 'Escuro'}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <div className="py-1">
              <button
                onClick={() => {
                  setTheme('light');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  theme === 'light' ? 'bg-gray-100 dark:bg-gray-700' : ''
                }`}
              >
                <Sun size={16} className="text-yellow-500" />
                <span className="text-gray-700 dark:text-gray-300">Tema Claro</span>
              </button>
              
              <button
                onClick={() => {
                  setTheme('dark');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  theme === 'dark' ? 'bg-gray-100 dark:bg-gray-700' : ''
                }`}
              >
                <Moon size={16} className="text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300">Tema Escuro</span>
              </button>
              
              <button
                onClick={() => {
                  // Detectar preferência do sistema
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  setTheme(prefersDark ? 'dark' : 'light');
                  setIsOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Monitor size={16} className="text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">Sistema</span>
              </button>
            </div>
          </div>
        )}

        {/* Overlay para fechar dropdown */}
        {isOpen && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    );
  }

  // Variant button (toggle simples)
  return (
    <button
      onClick={toggleTheme}
      className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 group"
      aria-label={`Mudar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
    >
      <div className="relative">
        {theme === 'light' ? (
          <Sun size={20} className="text-yellow-500 group-hover:rotate-12 transition-transform duration-200" />
        ) : (
          <Moon size={20} className="text-blue-400 group-hover:-rotate-12 transition-transform duration-200" />
        )}
      </div>
      
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {theme === 'light' ? 'Escuro' : 'Claro'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
