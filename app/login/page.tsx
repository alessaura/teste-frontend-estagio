"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, X } from "lucide-react";

import { authenticateUser, isAuthenticated, login } from "@/lib/auth";
import { Input, SubmitButton, Loader } from "@/components";

const Login = () => {
  const { push } = useRouter();
  const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);
  const [isCredentialsInvalid, setIsCredentialsInvalid] =
    useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [shakeUsername, setShakeUsername] = useState<boolean>(false);
  const [shakePassword, setShakePassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated()) {
      push("/dashboard");
    }
  }, [push]);

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setIsSubmitLoading(true);
  setIsCredentialsInvalid(false);
  setErrorMessage("");

  setShakeUsername(false);
  setShakePassword(false);

  if (!loginData.username || !loginData.password) {
    if (!loginData.username) setShakeUsername(true);
    if (!loginData.password) setShakePassword(true);
    setIsSubmitLoading(false);
    return;
  }

  try {
    // MUDANÇA AQUI - Nova estrutura de retorno
    const result = await authenticateUser(
      loginData.username,
      loginData.password
    );

    if (result.success && result.user) {
      // MUDANÇA AQUI - Passar dados do usuário para login
      login("dummy-token", result.user);
      push("/dashboard");
    } else {
      setIsCredentialsInvalid(true);
      setErrorMessage(
        "Credenciais inválidas. Verifique seu usuário e senha!"
      );
    }
  } catch (error) {
    console.error("Erro no login:", error);
    setErrorMessage(
      "Aconteceu um erro ao realizar o login. Tente novamente."
    );
  } finally {
    setIsSubmitLoading(false);
  }
};

  useEffect(() => {
    if (shakeUsername || shakePassword) {
      const timer = setTimeout(() => {
        setShakeUsername(false);
        setShakePassword(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shakeUsername, shakePassword]);

  return (
    <Suspense fallback="Carregando...">
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col w-[450px] p-8 bg-white rounded-xl shadow-lg">
          <h1 className="text-center font-bold text-[28px] md:text-[32px] hover:scale-[1.03] transition-all duration-500 cursor-default">
            Entrar na{" "}
            <span className="gradient-text from-secondary-purple to-primary-purple">
              Capivara AI
            </span>
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col mt-8 relative">
            <label
              className="block text-base font-medium mt-8 mb-2"
              htmlFor="username-input"
            >
              Usuário
            </label>
            <Input
              id="username-input"
              type="text"
              placeholder="Digite seu usuário"
              value={loginData.username}
              onChange={(event) => {
                setLoginData({ ...loginData, username: event.target.value });
                if (isCredentialsInvalid) setIsCredentialsInvalid(false);
              }}
              state={isCredentialsInvalid ? "error" : "default"}
              disabled={isSubmitLoading}
              className={`${shakeUsername && "animate-shake"}`}
            />

            <label
              className="block text-base font-medium mt-8 mb-2"
              htmlFor="password-input"
            >
              Senha
            </label>
            <Input
              id="password-input"
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua senha"
              value={loginData.password}
              onChange={(event) => {
                setLoginData({ ...loginData, password: event.target.value });
                if (isCredentialsInvalid) setIsCredentialsInvalid(false);
              }}
              state={isCredentialsInvalid ? "error" : "default"}
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

            {errorMessage && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <X size={16} className="text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-sm">{errorMessage}</span>
              </div>
            )}

            <SubmitButton
              title="Entrar"
              className="mt-8"
              disabled={isSubmitLoading}
            />

            <div className="mt-6 text-center">
              <span className="text-gray-600">Não tem uma conta? </span>
              <button
                type="button"
                onClick={() => push("/signup")}
                className="text-primary-purple hover:text-secondary-purple font-medium transition-colors"
              >
                Cadastre-se
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

export default Login;
