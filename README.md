# tech-flow

![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat&logo=node.js&logoColor=white)  
![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-3178C6?style=flat&logo=typescript&logoColor=white)  
![Express](https://img.shields.io/badge/Express-5.1+-000000?style=flat&logo=express&logoColor=white)  
![Sequelize](https://img.shields.io/badge/Sequelize-6+-52B0E7?style=flat&logo=sequelize&logoColor=white)  
![Redis](https://img.shields.io/badge/Redis-7+-DC382D?style=flat&logo=redis&logoColor=white)  
![InversifyJS](https://img.shields.io/badge/InversifyJS-DI-00b5ad?style=flat&logo=inversify&logoColor=white)  

**tech-flow** é um sistema de gerenciamento de projetos e tarefas com **autenticação JWT**, integração com **GitHub** e recursos de cache utilizando **Redis**. Foi desenvolvido com **Express.js**, **TypeScript**, **Sequelize ORM** e **InversifyJS** para injeção de dependência.

---

## 🚀 Funcionalidades

- **Autenticação JWT** - Registro, login, refresh token e logout  
- **Gerenciamento de Projetos** - CRUD completo de projetos por usuário  
- **Gerenciamento de Tarefas** - CRUD de tarefas vinculadas a projetos  
- **Integração GitHub** - Consulta repositórios públicos e vincula aos projetos  
- **Validação de dados** - Schemas de validação com **Zod**  
- **Banco MySQL** - Persistência de dados com **Sequelize ORM**  
- **Cache Redis** - Otimização de consultas e redução de chamadas externas  
- **InversifyJS** - Injeção de dependência para modularidade e escalabilidade  

---

## 📁 Estrutura de Pastas e Módulos

```bash
src
├── common
│   ├── di          # Configuração de Inversify (injeção de dependência)
│   ├── errors      # Classes de erros personalizados
│   └── tokens      # Tokens de identificação para serviços e repositórios
├── config          # Configurações globais (DB, Redis, etc.)
├── middleware      # Middlewares globais (auth, logger, etc.)
├── modules
│   ├── auth        # Autenticação e JWT
│   │   ├── controller
│   │   ├── jwt
│   │   ├── repository
│   │   └── services
│   ├── cache       # Integração e utilitários de cache Redis
│   ├── db          # Inicialização do Sequelize e conexão MySQL
│   ├── github      # Serviços para integração com a API do GitHub
│   ├── projects    # CRUD de projetos
│   │   ├── controller
│   │   ├── repositories
│   │   └── services
│   ├── task        # CRUD de tarefas
│   │   ├── controller
│   │   ├── repositories
│   │   └── services
│   └── user        # Serviços e repositórios de usuários
├── models          # Modelos Sequelize (User, Project, Task)
├── routes          # Definição centralizada das rotas
└── server.ts       # Ponto de entrada da aplicação
```

### 🔎 Explicação dos Módulos

- **Auth** → Responsável pela autenticação de usuários com JWT (registro, login, refresh token, logout).  
- **Cache** → Implementação de cache com Redis para consultas e respostas da API (ex.: repositórios GitHub).  
- **DB** → Configuração e inicialização da conexão com MySQL usando Sequelize.  
- **GitHub** → Integração com a API pública do GitHub para buscar repositórios e associá-los a projetos.  
- **Projects** → CRUD de projetos, com regras de negócio para associação ao usuário autenticado.  
- **Task** → CRUD de tarefas, sempre vinculadas a um projeto.  
- **User** → Camada de repositórios e serviços para manipulação de dados de usuários.  
- **Common** → Contém utilitários comuns como tratamento de erros, tokens de DI e configuração da injeção de dependência.  

---

## ⚡ Como rodar o projeto

### 1. Clone o repositório
```bash
git clone https://github.com/zYasuo/tech-flow.git
cd tech-flow
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
# Servidor
NODE_ENV=development
SERVER_PORT=3001

# Banco de dados
DB_NAME_SEQUELIZE=tech-flow
DB_USER_SEQUELIZE=root
DB_PASSWORD_SEQUELIZE=sua_senha
DB_HOST_SEQUELIZE=localhost
DB_PORT_SEQUELIZE=3306

# JWT
JWT_SECRET=seu_jwt_secret
JWT_ISSUER=tech-flow
JWT_AUDIENCE=api-users

# Redis
REDIS_USERNAME=default
REDIS_PASSWORD=sua_senha_redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 4. Rodando a aplicação

#### 🐳 **Com Docker (Recomendado)**

Para Windows:
```powershell
# Iniciar Docker Desktop
npm run docker:start

# Ambiente de desenvolvimento
npm run docker:dev

# Ambiente de produção
npm run docker:prod
```

Para Linux/Mac:
```bash
# Iniciar containers
docker-compose up -d

# Ver logs
docker-compose logs -f
```

#### 💻 **Desenvolvimento Local**

Execute as migrations (opcional, se usar SQL/Sequelize-CLI):
```bash
npx sequelize-cli db:migrate
```

Modo desenvolvimento (com **hot reload**):
```bash
npm run dev
```

Rodar os testes automatizados:
```bash
npm test
```

Gerar build de produção:
```bash
npm run build
```

Executar em produção:
```bash
npm start
```

> Após iniciar, a API estará disponível em:  
👉 `http://localhost:3001`  
👉 Health Check: `http://localhost:3001/health`

---

## 🐳 Comandos Docker

### Windows (PowerShell)
| Comando | Descrição |
|---------|-----------|
| `npm run docker:start` | Inicia o Docker Desktop |
| `npm run docker:dev` | Ambiente de desenvolvimento (MySQL + Redis + API local) |
| `npm run docker:prod` | Ambiente de produção completo |
| `npm run docker:redis` | Acessa o Redis CLI |
| `npm run docker:clean` | Limpa completamente o ambiente |
| `npm run docker:health` | Testa o health check da API |
| `npm run docker:up` | Inicia containers |
| `npm run docker:down` | Para containers |

### Linux/Mac
| Comando | Descrição |
|---------|-----------|
| `docker-compose up -d` | Inicia todos os serviços |
| `docker-compose down` | Para todos os serviços |
| `docker-compose logs -f` | Visualiza logs |
| `docker-compose restart` | Reinicia serviços |

---

## 📝 Autor

**Danilo Aguiar**  
Desenvolvedor Full Stack • Node.js | React |  TypeScript  
