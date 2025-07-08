"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, X, CheckCircle } from "lucide-react";

import { registerUser, isAuthenticated } from "@/lib/auth";
import { Input, SubmitButton, Loader } from "@/components";

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const Signup = () => {
  const { push } = useRouter();
  const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Estados de shake para cada campo
  const [shakeUsername, setShakeUsername] = useState<boolean>(false);
  const [shakeEmail, setShakeEmail] = useState<boolean>(false);
  const [shakePassword, setShakePassword] = useState<boolean>(false);
  const [shakeConfirmPassword, setShakeConfirmPassword] = useState<boolean>(false);

  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Redirecionar se já autenticado
  useEffect(() => {
    if (isAuthenticated()) {
      push("/dashboard");
    }
  }, [push]);

  // Validações
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let hasErrors = false;

    // Reset shake states
    setShakeUsername(false);
    setShakeEmail(false);
    setShakePassword(false);
    setShakeConfirmPassword(false);

    // Validar username
    if (!formData.username.trim()) {
      newErrors.username = "Nome de usuário é obrigatório";
      setShakeUsername(true);
      hasErrors = true;
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
      setShakeEmail(true);
      hasErrors = true;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Email inválido";
      setShakeEmail(true);
      hasErrors = true;
    }

    // Validar senha
    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
      setShakePassword(true);
      hasErrors = true;
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
      setShakePassword(true);
      hasErrors = true;
    }

    // Validar confirmação de senha
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirmação de senha é obrigatória";
      setShakeConfirmPassword(true);
      hasErrors = true;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Senhas não coincidem";
      setShakeConfirmPassword(true);
      hasErrors = true;
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateForm()) {
      setIsSubmitLoading(false);
      return;
    }

    try {
      const isRegistered = await registerUser(
        formData.username,
        formData.password,
        formData.email
      );

      if (isRegistered) {
        setSuccessMessage("Cadastro realizado com sucesso! Redirecionando...");
        setTimeout(() => {
          push("/login");
        }, 2000);
      } else {
        setErrorMessage("Usuário ou email já existe. Tente outro.");
      }
    } catch (error) {
      console.error("Erro no cadastro:", error);
      setErrorMessage("Erro interno do servidor. Tente novamente.");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  // Limpar shake animation
  useEffect(() => {
    if (shakeUsername || shakeEmail || shakePassword || shakeConfirmPassword) {
      const timer = setTimeout(() => {
        setShakeUsername(false);
        setShakeEmail(false);
        setShakePassword(false);
        setShakeConfirmPassword(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shakeUsername, shakeEmail, shakePassword, shakeConfirmPassword]);

  return (
    <Suspense fallback="Carregando...">
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col w-[450px] p-8 bg-white rounded-xl shadow-lg">
          <h1 className="text-center font-bold text-[28px] md:text-[32px] hover:scale-[1.03] transition-all duration-500 cursor-default">
            Cadastrar na{" "}
            <span className="gradient-text from-secondary-purple to-primary-purple">
              Capivara AI
            </span>
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col mt-8 relative">
            {/* Campo Username */}
            <label
              className="block text-base font-medium mt-8 mb-2"
              htmlFor="username-input"
            >
              Nome de Usuário
            </label>
            <Input
              id="username-input"
              type="text"
              placeholder="Digite seu nome de usuário"
              value={formData.username}
              onChange={(event) => {
                setFormData({ ...formData, username: event.target.value });
                if (errors.username) setErrors({ ...errors, username: undefined });
              }}
              state={errors.username ? "error" : "default"}
              disabled={isSubmitLoading}
              className={`${shakeUsername && "animate-shake"}`}
            />
            {errors.username && (
              <span className="text-red-500 text-sm mt-1">{errors.username}</span>
            )}

            {/* Campo Email */}
            <label
              className="block text-base font-medium mt-6 mb-2"
              htmlFor="email-input"
            >
              Email
            </label>
            <Input
              id="email-input"
              type="email"
              placeholder="Digite seu email"
              value={formData.email}
              onChange={(event) => {
                setFormData({ ...formData, email: event.target.value });
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              state={errors.email ? "error" : "default"}
              disabled={isSubmitLoading}
              className={`${shakeEmail && "animate-shake"}`}
            />
            {errors.email && (
              <span className="text-red-500 text-sm mt-1">{errors.email}</span>
            )}

            {/* Campo Senha */}
            <label
              className="block text-base font-medium mt-6 mb-2"
              htmlFor="password-input"
            >
              Senha
            </label>
            <Input
              id="password-input"
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua senha (mín. 6 caracteres)"
              value={formData.password}
              onChange={(event) => {
                setFormData({ ...formData, password: event.target.value });
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              state={errors.password ? "error" : "default"}
              disabled={isSubmitLoading}
              className={`${shakePassword && "animate-shake"}`}
              icon={
                showPassword ? (
                  <EyeOff size={20} className="text-primary-purple" />
                ) : (
                  <Eye size={20} className="text-primary-purple" />
                )
              }
              onClickIcon={() => setShowPassword((prev) => !prev)}
            />
            {errors.password && (
              <span className="text-red-500 text-sm mt-1">{errors.password}</span>
            )}

            {/* Campo Confirmação de Senha */}
            <label
              className="block text-base font-medium mt-6 mb-2"
              htmlFor="confirm-password-input"
            >
              Confirmar Senha
            </label>
            <Input
              id="confirm-password-input"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirme sua senha"
              value={formData.confirmPassword}
              onChange={(event) => {
                setFormData({ ...formData, confirmPassword: event.target.value });
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
              }}
              state={errors.confirmPassword ? "error" : "default"}
              disabled={isSubmitLoading}
              className={`${shakeConfirmPassword && "animate-shake"}`}
              icon={
                showConfirmPassword ? (
                  <EyeOff size={20} className="text-primary-purple" />
                ) : (
                  <Eye size={20} className="text-primary-purple" />
                )
              }
              onClickIcon={() => setShowConfirmPassword((prev) => !prev)}
            />
            {errors.confirmPassword && (
              <span className="text-red-500 text-sm mt-1">{errors.confirmPassword}</span>
            )}

            {/* Mensagem de Erro */}
            {errorMessage && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <X size={16} className="text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-sm">{errorMessage}</span>
              </div>
            )}

            {/* Mensagem de Sucesso */}
            {successMessage && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                <span className="text-green-700 text-sm">{successMessage}</span>
              </div>
            )}

            <SubmitButton
              title="Cadastrar"
              className="mt-8"
              disabled={isSubmitLoading}
            />

            <div className="mt-6 text-center">
              <span className="text-gray-600">Já tem uma conta? </span>
              <button
                type="button"
                onClick={() => push("/login")}
                className="text-primary-purple hover:text-secondary-purple font-medium transition-colors"
              >
                Faça login
              </button>
            </div>

            {isSubmitLoading && (
              <div className="absolute top-1/2 transform -translate-y-1/2 w-full">
                <Loader />
              </div>
            )}
          </form>
        </div>
      </div>
    </Suspense>
  );
};

export default Signup;