# Teste Técnico - Estágio Frontend

## Descrição

Este é um teste técnico para candidatos à vaga de estágio frontend. A aplicação consiste em uma página de login funcional baseada em um arquivo JSON com credenciais.

## Entrega do Teste

A data limite para a entrega do teste é **sexta-feira (11/07) às 23h59**.
Quaisquer consultas necessárias para o teste estão liberadas, mas lembre-se que o que for desenvolvido será questionado na entrevista técnica.
Ao finalizar, faça upload do projeto em um repositório público no GitHub e envie o link para Rodrigo Pires no LinkedIn.

## Desafio para o Candidato

### 🎯 **Implementar a Página de Cadastro**

O candidato deve criar a página `/signup` com:

1. **Formulário de Registro**:

   - Campo de nome de usuário
   - Campo de email
   - Campo de senha
   - Campo de confirmação de senha

2. **Validações**:

   - Email válido
   - Senha com mínimo 6 caracteres
   - Confirmação de senha igual
   - Usuário não existente

3. **Feedback Visual**:

   - Estados de loading
   - Mensagens de erro/sucesso
   - Animações de shake para campos inválidos

4. **Integração**:
   - Usar os componentes existentes (`Input`, `SubmitButton`, `Loader`)
   - Integrar com as funções de auth em `lib/auth.ts`
   - Redirecionar para `/login` após cadastro bem-sucedido

### 📝 **Critérios de Avaliação**

- **Funcionalidade** (40 pontos): Formulário funciona corretamente
- **Validação** (30 pontos): Validações implementadas adequadamente
- **Design** (20 pontos): Consistência visual com o login
- **Código** (10 pontos): Código limpo e bem estruturado

### (OPCIONAL) 🏆 **Funcionalidades Bônus (até 40 pontos extras)**

**Sistema de Notificações (Toast) - +20 pontos**

- [ ] Componente `Toast` reutilizável
- [ ] Contexto para gerenciar notificações
- [ ] Diferentes tipos: success, error, warning, info
- [ ] Animações suaves
- [ ] Auto-dismiss configurável

**Melhorias de UX - +10 pontos**

- [ ] Loading states em todos os botões
- [ ] Skeleton loading no dashboard
- [ ] Tooltips nos campos de formulário
- [ ] Validação em tempo real
- [ ] "Lembrar de mim" no login

**Funcionalidades Avançadas - +10 pontos**

- [ ] Página de recuperação de senha (`/forgot-password`)
- [ ] Indicador de força de senha
- [ ] Toggle de tema escuro/claro
- [ ] Perfil do usuário no dashboard
- [ ] Logout automático por inatividade

### Outras melhorias possíveis:

- 🔄 Integração com API real
- 🔄 Persistência de dados em banco
- 🔄 Testes automatizados
- 🔄 PWA capabilities
- 🔄 Tema escuro/claro

### 💡 **Dicas**

- Use os componentes existentes como base
- Siga o mesmo padrão visual do login
- Teste todas as validações
- Mantenha a consistência do código

---

# Documentação do Projeto

## Funcionalidades

- ✅ **Página de Login**: Autenticação baseada em arquivo JSON
- 🔄 **Página de Cadastro**: **PRECISA SER IMPLEMENTADA PELO CANDIDATO**
- ✅ **Dashboard**: Página protegida para usuários autenticados
- ✅ **Validação de Formulários**: Validação em tempo real
- ✅ **Feedback Visual**: Animações e estados de loading
- ✅ **Responsividade**: Design responsivo com Tailwind CSS

## Stack Tecnológica

- **React 18** - Biblioteca JavaScript para interfaces
- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **Lucide React** - Ícones

## Como Executar o Projeto

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

1. **Clone o repositório** (se aplicável):

```bash
git clone <url-do-repositorio>
cd teste-frontend
```

2. **Instale as dependências**:

```bash
npm install
# ou
yarn install
```

3. **Execute o servidor de desenvolvimento**:

```bash
npm run dev
# ou
yarn dev
```

4. **Acesse a aplicação**:
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## Credenciais de Teste

A aplicação vem com algumas credenciais pré-definidas para teste:

| Usuário | Senha    | Email             |
| ------- | -------- | ----------------- |
| admin   | admin123 | admin@example.com |
| user    | user123  | user@example.com  |
| teste   | teste123 | teste@example.com |

## Estrutura do Projeto

```
teste-frontend/
├── app/                    # App Router do Next.js
│   ├── dashboard/         # Página do dashboard
│   ├── signup/           # Página de cadastro (PRECISA SER IMPLEMENTADA)
│   ├── globals.css       # Estilos globais
│   ├── layout.tsx        # Layout raiz
│   └── page.tsx          # Página de login (home)
├── components/            # Componentes reutilizáveis
│   ├── Input.tsx         # Componente de input
│   ├── SubmitButton.tsx  # Componente de botão
│   ├── Loader.tsx        # Componente de loading
│   └── index.ts          # Exportações
├── lib/                  # Utilitários
│   └── auth.ts           # Funções de autenticação
└── package.json          # Dependências e scripts
```

## Funcionalidades Implementadas

### Página de Login (`/`)

- Formulário de login com validação
- Animações de shake para campos obrigatórios
- Toggle de visibilidade da senha
- Estados de loading durante autenticação
- Redirecionamento automático se já autenticado
- Link para página de cadastro

### Página de Cadastro (`/signup`) - **PRECISA SER IMPLEMENTADA**

**O candidato deve implementar a página de cadastro com:**

- [ ] Formulário completo de registro
- [ ] Validação de email
- [ ] Confirmação de senha
- [ ] Validação de força da senha (mínimo 6 caracteres)
- [ ] Verificação de usuário existente
- [ ] Feedback de sucesso/erro
- [ ] Redirecionamento para login após cadastro
- [ ] Design consistente com a página de login

**Exemplo de estrutura esperada:**

```typescript
// app/signup/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, SubmitButton, Loader } from "@/components";

const Signup = () => {
  // Implementar formulário de cadastro
  // Usar os componentes existentes
  // Seguir o mesmo padrão visual do login
};
```

### Dashboard (`/dashboard`)

- Página protegida (requer autenticação)
- Navegação com logout
- Exibição das credenciais de teste
- Redirecionamento para login se não autenticado

## Autenticação

A autenticação é simulada usando:

- **LocalStorage** para persistir o token
- **Credenciais hardcoded** no arquivo `lib/auth.ts`
- **Delay simulado** para simular chamadas de API

## Estilo e Design

O design deve seguir o padrão fornecido:

- **Cores**: Gradiente roxo (primary-purple: #4F46E5, secondary-purple: #7C3AED)
- **Tipografia**: Inter (Google Fonts)
- **Animações**: Shake para validação, hover effects
- **Layout**: Centrado, responsivo, com sombras e bordas arredondadas

## Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # Linting do código
```

## Contato

Para dúvidas sobre o teste, entre em contato com o Rodrigo Pires.

---

**Boa sorte no teste! 🚀**
