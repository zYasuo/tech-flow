# Script para acessar o Redis
Write-Host "Acessando Redis..." -ForegroundColor Green

# Verificar se o container do Redis esta rodando
$redisContainer = docker ps --format "table {{.Names}}\t{{.Status}}" | Select-String "tech-flow-redis"
if (-not $redisContainer) {
    Write-Host "Container do Redis nao esta rodando!" -ForegroundColor Red
    Write-Host "Execute primeiro: npm run docker:manual" -ForegroundColor Yellow
    exit 1
}

Write-Host "Container Redis encontrado. Conectando..." -ForegroundColor Yellow
Write-Host "Comandos uteis:" -ForegroundColor Cyan
Write-Host "   KEYS *                    - Ver todas as chaves" -ForegroundColor White
Write-Host "   GET nome_da_chave         - Ver valor de uma chave" -ForegroundColor White
Write-Host "   SET chave valor           - Definir uma chave" -ForegroundColor White
Write-Host "   DEL nome_da_chave         - Deletar uma chave" -ForegroundColor White
Write-Host "   EXIT                      - Sair do Redis" -ForegroundColor White
Write-Host ""

# Conectar ao Redis
docker exec -it tech-flow-redis redis-cli
