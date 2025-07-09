"use client";
import { useState } from 'react';
import { User, Edit3, Save, X, Mail, Calendar, Shield } from 'lucide-react';
import { User as UserType } from '@/lib/auth';
import { Input, SubmitButton } from '@/components';
import { useToast } from '@/contexts/ToastContext';

interface UserProfileProps {
  user: UserType;
  onUpdateUser: (updatedUser: UserType) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editData, setEditData] = useState({
    username: user.username,
    email: user.email
  });
  const { showToast } = useToast();

  // Validações
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      isValid: emailRegex.test(email),
      message: !emailRegex.test(email) ? "Email inválido" : undefined
    };
  };

  const validateUsername = (username: string) => {
    if (username.length < 3) {
      return {
        isValid: false,
        message: "Nome de usuário deve ter pelo menos 3 caracteres"
      };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return {
        isValid: false,
        message: "Apenas letras, números e underscore são permitidos"
      };
    }
    return { isValid: true };
  };

  const handleSave = async () => {
    // Validar dados
    const usernameValidation = validateUsername(editData.username);
    const emailValidation = validateEmail(editData.email);

    if (!usernameValidation.isValid) {
      showToast(usernameValidation.message!, "error");
      return;
    }

    if (!emailValidation.isValid) {
      showToast(emailValidation.message!, "error");
      return;
    }

    setIsLoading(true);

    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedUser = { 
        ...user, 
        username: editData.username,
        email: editData.email
      };
      
      onUpdateUser(updatedUser);
      setIsEditing(false);
      showToast("Perfil atualizado com sucesso!", "success");
    } catch (error) {
      showToast("Erro ao atualizar perfil. Tente novamente.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      username: user.username,
      email: user.email
    });
    setIsEditing(false);
  };

  // Simular data de criação da conta
  const accountCreated = new Date().toLocaleDateString('pt-BR');

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <User size={24} className="mr-3 text-primary-purple" />
          Meu Perfil
        </h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-4 py-2 text-primary-purple hover:text-secondary-purple hover:bg-purple-50 rounded-lg transition-all duration-200"
          >
            <Edit3 size={16} />
            <span>Editar</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome de usuário
            </label>
            <Input
              type="text"
              value={editData.username}
              onChange={(e) => setEditData({ ...editData, username: e.target.value })}
              placeholder="Nome de usuário"
              disabled={isLoading}
              realTimeValidation={validateUsername}
              tooltip="Mínimo 3 caracteres, apenas letras, números e underscore"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={editData.email}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              placeholder="Email"
              disabled={isLoading}
              realTimeValidation={validateEmail}
              tooltip="Digite um email válido"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-primary-purple text-white px-6 py-2 rounded-lg hover:bg-secondary-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              <span>{isLoading ? "Salvando..." : "Salvar"}</span>
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              <X size={16} />
              <span>Cancelar</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Informações principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <User size={20} className="text-gray-600" />
                <div>
                  <span className="text-sm text-gray-500 block">Nome de usuário</span>
                  <p className="font-medium text-gray-900">{user.username}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Mail size={20} className="text-gray-600" />
                <div>
                  <span className="text-sm text-gray-500 block">Email</span>
                  <p className="font-medium text-gray-900">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Calendar size={20} className="text-gray-600" />
                <div>
                  <span className="text-sm text-gray-500 block">Membro desde</span>
                  <p className="font-medium text-gray-900">{accountCreated}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <Shield size={20} className="text-green-600" />
                <div>
                  <span className="text-sm text-green-600 block">Status da conta</span>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Ativa
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Verificada
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Estatísticas da conta */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Estatísticas da Conta</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-purple">1</div>
                <div className="text-sm text-gray-600">Logins hoje</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">7</div>
                <div className="text-sm text-gray-600">Dias ativo</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">100%</div>
                <div className="text-sm text-gray-600">Segurança</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;