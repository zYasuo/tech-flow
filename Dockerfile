# Multi-stage build para otimizar o tamanho da imagem
FROM node:18-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig*.json ./

# Instalar todas as dependências (incluindo devDependencies para build)
RUN npm ci

# Copiar código fonte
COPY src/ ./src/

# Compilar TypeScript
RUN npm run build

# Stage de produção
FROM node:18-alpine AS production

# Instalar dependências de produção e ferramentas
RUN apk add --no-cache dumb-init mysql-client redis curl netcat-openbsd

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production && npm cache clean --force

# Copiar código compilado do stage anterior
COPY --from=builder /app/build ./build

# Copiar arquivos de configuração
COPY tsconfig*.json ./

# Copiar scripts (PowerShell para Windows)
COPY scripts/ ./scripts/

# Mudar propriedade dos arquivos para o usuário nodejs
RUN chown -R nodejs:nodejs /app

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Usar dumb-init para gerenciar sinais
ENTRYPOINT ["dumb-init", "--"]

# Tornar script executável
RUN chmod +x scripts/start-container.sh

# Comando para iniciar a aplicação
CMD ["sh", "scripts/start-container.sh"]
