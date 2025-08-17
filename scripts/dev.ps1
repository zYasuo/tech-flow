# Script para ambiente de desenvolvimento
Write-Host "Configurando ambiente de desenvolvimento..." -ForegroundColor Green

# Verificar se o Docker esta rodando
docker info 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker nao esta rodando!" -ForegroundColor Red
    Write-Host "Execute primeiro: .\scripts\start-docker.ps1" -ForegroundColor Yellow
    exit 1
}

# Parar containers existentes
Write-Host "Parando containers existentes..." -ForegroundColor Yellow
docker-compose down 2>$null

# Iniciar apenas MySQL e Redis
Write-Host "Iniciando MySQL e Redis..." -ForegroundColor Cyan
docker-compose up -d mysql redis

# Aguardar MySQL estar pronto
Write-Host "Aguardando MySQL inicializar..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0

while ($attempt -lt $maxAttempts) {
    docker exec tech-flow-mysql mysqladmin ping -h localhost -u root -proot_password 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "MySQL esta pronto!" -ForegroundColor Green
        break
    }
    
    $attempt++
    Write-Host "Tentativa $attempt/$maxAttempts..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
}

if ($attempt -eq $maxAttempts) {
    Write-Host "Timeout: MySQL nao conseguiu inicializar" -ForegroundColor Red
    exit 1
}

# Aguardar Redis estar pronto
Write-Host "Aguardando Redis inicializar..." -ForegroundColor Yellow
$attempt = 0

while ($attempt -lt $maxAttempts) {
    docker exec tech-flow-redis redis-cli ping 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Redis esta pronto!" -ForegroundColor Green
        break
    }
    
    $attempt++
    Write-Host "Tentativa $attempt/$maxAttempts..." -ForegroundColor Yellow
    Start-Sleep -Seconds 1
}

if ($attempt -eq $maxAttempts) {
    Write-Host "Timeout: Redis nao conseguiu inicializar" -ForegroundColor Red
    exit 1
}

# Executar migracoes
Write-Host "Executando migracoes..." -ForegroundColor Cyan
.\scripts\run-migrations.ps1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao executar migracoes!" -ForegroundColor Red
    exit 1
}

# Instalar dependencias se necessario
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias..." -ForegroundColor Cyan
    npm install
}

# Iniciar aplicacao em modo desenvolvimento
Write-Host "Iniciando aplicacao em modo desenvolvimento..." -ForegroundColor Green
Write-Host "Servicos disponiveis:" -ForegroundColor Cyan
Write-Host "   - API: http://localhost:3001" -ForegroundColor White
Write-Host "   - MySQL: localhost:3306" -ForegroundColor White
Write-Host "   - Redis: localhost:6379" -ForegroundColor White
Write-Host "   - Health Check: http://localhost:3001/health" -ForegroundColor White
Write-Host ""
Write-Host "Para parar: Ctrl+C" -ForegroundColor Yellow
Write-Host "Para limpar: .\scripts\clean.ps1" -ForegroundColor Yellow

npm run dev
