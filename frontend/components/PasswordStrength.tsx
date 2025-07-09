"use client";

interface PasswordStrengthProps {
  password: string;
  showDetails?: boolean;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ 
  password, 
  showDetails = true 
}) => {
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    let feedback = [];
    let requirements = {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    };

    // Verificar comprimento
    if (password.length >= 8) {
      strength++;
      requirements.length = true;
    } else {
      feedback.push("Pelo menos 8 caracteres");
    }

    // Verificar letra maiúscula
    if (/[A-Z]/.test(password)) {
      strength++;
      requirements.uppercase = true;
    } else {
      feedback.push("Uma letra maiúscula");
    }

    // Verificar letra minúscula
    if (/[a-z]/.test(password)) {
      strength++;
      requirements.lowercase = true;
    } else {
      feedback.push("Uma letra minúscula");
    }

    // Verificar número
    if (/[0-9]/.test(password)) {
      strength++;
      requirements.number = true;
    } else {
      feedback.push("Um número");
    }

    // Verificar caractere especial
    if (/[^A-Za-z0-9]/.test(password)) {
      strength++;
      requirements.special = true;
    } else {
      feedback.push("Um caractere especial");
    }

    return { strength, feedback, requirements };
  };

  const { strength, feedback, requirements } = getPasswordStrength(password);

  const strengthConfig = {
    0: { 
      label: "Muito fraca", 
      color: "bg-red-500", 
      textColor: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    },
    1: { 
      label: "Fraca", 
      color: "bg-red-400", 
      textColor: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    },
    2: { 
      label: "Regular", 
      color: "bg-yellow-500", 
      textColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200"
    },
    3: { 
      label: "Boa", 
      color: "bg-blue-500", 
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    4: { 
      label: "Forte", 
      color: "bg-green-500", 
      textColor: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    5: { 
      label: "Muito forte", 
      color: "bg-green-600", 
      textColor: "text-green-700",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
  };

  const currentStrength = strengthConfig[strength as keyof typeof strengthConfig];

  if (!password) return null;

  return (
    <div className={`mt-3 p-3 rounded-lg border ${currentStrength.bgColor} ${currentStrength.borderColor}`}>
      {/* Indicador principal */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Força da senha:</span>
        <span className={`text-sm font-semibold ${currentStrength.textColor}`}>
          {currentStrength.label}
        </span>
      </div>
      
      {/* Barra de progresso */}
      <div className="flex space-x-1 mb-3">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-2 flex-1 rounded-full transition-all duration-300 ${
              level <= strength ? currentStrength.color : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Detalhes dos requisitos */}
      {showDetails && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-600 mb-2">Requisitos:</div>
          <div className="grid grid-cols-1 gap-1 text-xs">
            <RequirementItem 
              met={requirements.length} 
              text="Pelo menos 8 caracteres" 
            />
            <RequirementItem 
              met={requirements.uppercase} 
              text="Uma letra maiúscula (A-Z)" 
            />
            <RequirementItem 
              met={requirements.lowercase} 
              text="Uma letra minúscula (a-z)" 
            />
            <RequirementItem 
              met={requirements.number} 
              text="Um número (0-9)" 
            />
            <RequirementItem 
              met={requirements.special} 
              text="Um caractere especial (!@#$%...)" 
            />
          </div>
        </div>
      )}

      {/* Dicas para melhorar */}
      {feedback.length > 0 && strength < 4 && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-600">
            <span className="font-medium">Para melhorar: </span>
            {feedback.join(", ")}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente auxiliar para mostrar requisitos
const RequirementItem: React.FC<{ met: boolean; text: string }> = ({ met, text }) => (
  <div className="flex items-center space-x-2">
    <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
      met ? 'bg-green-500' : 'bg-gray-300'
    }`}>
      {met && (
        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
    </div>
    <span className={`text-xs ${met ? 'text-green-700' : 'text-gray-500'}`}>
      {text}
    </span>
  </div>
);

export default PasswordStrength;