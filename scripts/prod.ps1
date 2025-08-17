# Script para ambiente de producao
Write-Host "Configurando ambiente de producao..." -ForegroundColor Green

# Verificar se o Docker esta rodando
$dockerRunning = docker info 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker nao esta rodando!" -ForegroundColor Red
    Write-Host "Execute primeiro: .\scripts\start-docker.ps1" -ForegroundColor Yellow
    exit 1
}

# Parar containers existentes
Write-Host "Parando containers existentes..." -ForegroundColor Yellow
docker-compose down 2>$null

# Build da imagem da API
Write-Host "Construindo imagem da API..." -ForegroundColor Cyan
docker-compose build api

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao construir imagem da API!" -ForegroundColor Red
    exit 1
}

# Iniciar todos os servicos
Write-Host "Iniciando todos os servicos..." -ForegroundColor Cyan
docker-compose up -d

# Aguardar servicos estarem prontos
Write-Host "Aguardando servicos inicializarem..." -ForegroundColor Yellow
$maxAttempts = 60
$attempt = 0

while ($attempt -lt $maxAttempts) {
    $apiReady = Invoke-WebRequest -Uri "http://localhost:3002/api/v1/health" -UseBasicParsing -TimeoutSec 5 2>$null
    if ($LASTEXITCODE -eq 0 -and $apiReady.StatusCode -eq 200) {
        Write-Host "API esta pronta!" -ForegroundColor Green
        break
    }
    
    $attempt++
    Write-Host "Tentativa $attempt/$maxAttempts..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
}

if ($attempt -eq $maxAttempts) {
    Write-Host "Timeout: API nao conseguiu inicializar" -ForegroundColor Red
    Write-Host "Verificando logs..." -ForegroundColor Yellow
    docker-compose logs api
    exit 1
}

# Verificar status dos containers
Write-Host "Status dos containers:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "Ambiente de producao configurado!" -ForegroundColor Green
Write-Host "Servicos disponiveis:" -ForegroundColor Cyan
Write-Host "   - API: http://localhost:3002" -ForegroundColor White
Write-Host "   - MySQL: localhost:3306" -ForegroundColor White
Write-Host "   - Redis: localhost:6379" -ForegroundColor White
Write-Host "   - Health Check: http://localhost:3002/api/v1/health" -ForegroundColor White
Write-Host ""
Write-Host "Comandos uteis:" -ForegroundColor Yellow
Write-Host "   - Ver logs: .\scripts\logs.ps1" -ForegroundColor White
Write-Host "   - Parar: .\scripts\stop.ps1" -ForegroundColor White
Write-Host "   - Limpar: .\scripts\clean.ps1" -ForegroundColor White
