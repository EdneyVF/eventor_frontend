# Eventor Frontend

Eventor é uma plataforma web moderna para criação, gerenciamento e participação em eventos. Este repositório contém o código frontend da aplicação, desenvolvido com React, TypeScript e Material UI.

## 🚀 Funcionalidades

- **Autenticação de Usuários**: Sistema de login e registro com diferentes níveis de permissão (usuário comum e administrador)
- **Gerenciamento de Eventos**: Criação, edição e exclusão de eventos
- **Participação em Eventos**: Inscrição e cancelamento de participação em eventos
- **Painel Administrativo**: Aprovação/rejeição de eventos e gerenciamento de usuários
- **Filtros e Pesquisa**: Busca e filtragem de eventos por diversas categorias
- **Perfis de Usuário**: Visualização de eventos criados e eventos em que participa

## 🧰 Tecnologias Utilizadas

- **React**: Biblioteca para construção de interfaces
- **TypeScript**: Adiciona tipagem estática ao JavaScript
- **Material UI**: Framework de componentes para design moderno
- **React Router**: Gerenciamento de rotas e navegação
- **Axios**: Cliente HTTP para comunicação com a API
- **Vite**: Build tool e bundler

## 📋 Pré-requisitos

- Node.js (versão 16.x ou superior)
- npm ou yarn
- Backend do Eventor rodando (API REST)

## 🔧 Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/eventor_frontend.git
   cd eventor_frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   # ou
   yarn install
   ```

3. Configure o ambiente:
   - Crie um arquivo `.env` baseado no exemplo `.env.example`:
   ```
   VITE_API_URL=http://localhost:3001
   ```

## 💻 Como executar

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

2. Acesse a aplicação em:
   ```
   http://localhost:5173
   ```

## 🏗️ Estrutura do Projeto

```
eventor_frontend/
├── public/              # Arquivos estáticos
├── src/                 # Código fonte
│   ├── components/      # Componentes reutilizáveis
│   │   ├── admin/       # Componentes específicos para administração
│   │   ├── common/      # Componentes comuns (cards, botões, etc)
│   │   └── layout/      # Componentes de layout (header, footer)
│   ├── hooks/           # Custom hooks (useAuth, useEvents, etc)
│   ├── pages/           # Páginas da aplicação
│   ├── services/        # Serviços e comunicação com API
│   ├── context/         # Contextos React (AuthContext, etc)
│   ├── utils/           # Funções utilitárias
│   ├── App.tsx          # Componente principal
│   ├── main.tsx         # Ponto de entrada da aplicação
│   └── index.css        # Estilos globais
├── .env                 # Variáveis de ambiente
├── package.json         # Dependências e scripts
└── tsconfig.json        # Configuração do TypeScript
```

## 🔐 Autenticação

A autenticação é gerenciada pelo hook `useAuth` e utiliza tokens JWT. O token é armazenado no localStorage e incluído automaticamente em todas as requisições através do interceptor do Axios:

```typescript
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

## 👩‍💻 Fluxos Principais

### Para Usuários
1. Explorar eventos públicos
2. Registrar-se/fazer login
3. Criar eventos (que serão revisados por administradores)
4. Participar de eventos de outros usuários
5. Gerenciar perfil e visualizar eventos em que participa

### Para Administradores
1. Revisar eventos pendentes (aprovar/rejeitar)
2. Visualizar todos os eventos na plataforma
3. Gerenciar usuários
4. Realizar ações administrativas (excluir eventos, etc)

## 📚 Informações Adicionais

A aplicação utiliza React Router para navegação entre páginas e Context API para gerenciamento de estado global. O Material UI é usado para criar uma interface moderna e responsiva, seguindo os princípios de Material Design.

## 🧪 Testes

Para executar os testes:
```bash
npm test
# ou
yarn test
```

## 🛠️ Build para Produção

Para gerar a build de produção:
```bash
npm run build
# ou
yarn build
```

Os arquivos otimizados serão gerados na pasta `dist/`, prontos para serem servidos por qualquer servidor web estático.

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE.txt) para detalhes.

---

Desenvolvido com ❤️ por Edney Vasconcelos Freitas