# Documentação da API - ProjectPilot

## Configuração do Postman

### 1. Importar Collection
- Abra o Postman
- Clique em **Import** no canto superior esquerdo
- Selecione o arquivo `postman-collection.json`
- A collection **ProjectPilot API** será importada

### 2. Importar Environment
- No Postman, vá até **Environments** (ícone de engrenagem)
- Clique em **Import**
- Selecione o arquivo `postman-environment.json`
- Selecione o environment **ProjectPilot Environment**

### 3. Configurar Variáveis
Após importar, configure as seguintes variáveis no environment:

```
baseUrl: http://localhost:3001
githubUsername: seu-username-github
```

As variáveis `token`, `refreshToken`, `projectId` e `taskId` são preenchidas automaticamente pelos scripts dos requests.

## Fluxo de Teste Recomendado

### 1. Autenticação
1. **Register** - Criar novo usuário
2. **Login** - Obter tokens de autenticação

### 2. Gerenciamento de Projetos
1. **Create Project** - Criar novo projeto
2. **Get Project by ID** - Buscar projeto específico
3. **Update Project** - Atualizar projeto
4. **Delete Project** - Remover projeto
5. **GitHub Integration** - Vincular repositórios GitHub
6. **Remover integração GitHub** - Deletar repositórios vinculados

### 3. Gerenciamento de Tasks
1. **Create Task** - Criar nova task no projeto
2. **Update Task** - Atualizar task
3. **Delete Task** - Remover task

## Endpoints Principais

### Autenticação
- `POST /api/v1/auth/register` - Registrar usuário
- `POST /api/v1/auth/login` - Login do usuário

### Projetos
- `POST /api/v1/projects` - Criar projeto
- `GET /api/v1/projects/:id` - Buscar projeto
- `PUT /api/v1/projects/:id` - Atualizar projeto
- `DELETE /api/v1/projects/:id` - Deletar projeto
- `GET /api/v1/projects/:id/github/:username` - Integrar repositórios GitHub
- `DELETE /api/v1/projects/:id/github` - Remover integração GitHub

### Tasks
- `POST /api/v1/projects/:projectId/tasks` - Criar task
- `PUT /api/v1/tasks/:id` - Atualizar task
- `DELETE /api/v1/tasks/:id` - Deletar task

## Autenticação

Todos os endpoints (exceto registro e login) requerem autenticação via Bearer Token:

```
Authorization: Bearer {{token}}
```

O token é automaticamente configurado nos requests após o login bem-sucedido.

## Códigos de Status

- `200` - Success
- `201` - Created
- `400` - Bad Request (dados inválidos)
- `401` - Unauthorized (token inválido/expirado)
- `403` - Forbidden (sem permissão)
- `404` - Not Found
- `409` - Conflict (email já existe)
- `500` - Internal Server Error

## Exemplos de Resposta

### Sucesso
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Example"
  },
  "message": "Operation successful"
}
```

### Erro
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid data provided",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

## Integração GitHub

Para testar a integração GitHub:

1. Configure a variável `githubUsername` com um username válido do GitHub
2. Crie um projeto
3. Execute o request **GitHub Integration**
4. O sistema buscará os 5 últimos repositórios públicos e os vinculará ao projeto

## Troubleshooting

### Token Expirado
Se receber erro 401, execute o request **Login** novamente para renovar o token.

### Servidor Não Iniciado
Certifique-se de que o servidor está rodando em `http://localhost:3001`:

```bash
npm run dev
```

### Variáveis Não Configuradas
Certifique-se de que o environment correto está selecionado no Postman.