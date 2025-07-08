"use client";
import React, { useState } from "react";
import Tooltip from "./Tooltip";

interface InputProps {
  id?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  state?: "default" | "error" | "success";
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  onClickIcon?: () => void;
  tooltip?: string;
  realTimeValidation?: (value: string) => { isValid: boolean; message?: string };
  showValidationIcon?: boolean;
}

const Input: React.FC<InputProps> = ({
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  state = "default",
  disabled = false,
  className = "",
  icon,
  onClickIcon,
  tooltip,
  realTimeValidation,
  showValidationIcon = true,
}) => {
  const [validationState, setValidationState] = useState<{
    isValid: boolean;
    message?: string;
  }>({ isValid: true });
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event);
    
    // Validação em tempo real
    if (realTimeValidation && event.target.value) {
      const validation = realTimeValidation(event.target.value);
      setValidationState(validation);
    } else {
      setValidationState({ isValid: true });
    }
  };

  const finalState = !validationState.isValid ? "error" : 
                    (validationState.isValid && value && realTimeValidation) ? "success" : state;

  const baseClasses =
    "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200";

  const stateClasses = {
    default:
      "border-gray-300 focus:border-primary-purple focus:ring-primary-purple/20",
    error: "border-red-500 focus:border-red-500 focus:ring-red-500/20",
    success: "border-green-500 focus:border-green-500 focus:ring-green-500/20",
  };

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  // Ícone de validação
  const ValidationIcon = () => {
    if (!showValidationIcon || !value || !realTimeValidation) return null;
    
    if (validationState.isValid) {
      return (
        <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
  };

  const inputElement = (
    <div className="relative">
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        className={`${baseClasses} ${stateClasses[finalState]} ${disabledClasses} ${className} ${
          icon || (showValidationIcon && value && realTimeValidation) ? 'pr-12' : ''
        }`}
      />
      
      {/* Ícone de validação */}
      <ValidationIcon />
      
      {/* Ícone personalizado (ex: eye para senha) */}
      {icon && (
        <button
          type="button"
          onClick={onClickIcon}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-purple transition-colors"
          disabled={disabled}
        >
          {icon}
        </button>
      )}
      
      {/* Mensagem de validação */}
      {!validationState.isValid && validationState.message && isFocused && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600 shadow-sm z-10">
          {validationState.message}
        </div>
      )}
    </div>
  );

  return tooltip ? (
    <Tooltip content={tooltip}>{inputElement}</Tooltip>
  ) : (
    inputElement
  );
};

export default Input;