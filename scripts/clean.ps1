# Script para limpar ambiente
Write-Host "🧹 Limpando ambiente..." -ForegroundColor Yellow

# Parar e remover containers
Write-Host "🛑 Parando containers..." -ForegroundColor Cyan
docker-compose down -v 2>$null

# Remover imagens não utilizadas
Write-Host "🗑️ Removendo imagens não utilizadas..." -ForegroundColor Cyan
docker image prune -f 2>$null

# Remover volumes não utilizados
Write-Host "🗑️ Removendo volumes não utilizados..." -ForegroundColor Cyan
docker volume prune -f 2>$null

# Remover redes não utilizadas
Write-Host "🗑️ Removendo redes não utilizadas..." -ForegroundColor Cyan
docker network prune -f 2>$null

# Limpar cache do npm
Write-Host "🗑️ Limpando cache do npm..." -ForegroundColor Cyan
npm cache clean --force 2>$null

# Remover node_modules e build se existirem
if (Test-Path "node_modules") {
    Write-Host "🗑️ Removendo node_modules..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force "node_modules"
}

if (Test-Path "build") {
    Write-Host "🗑️ Removendo build..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force "build"
}

if (Test-Path "coverage") {
    Write-Host "🗑️ Removendo coverage..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force "coverage"
}

Write-Host "✅ Ambiente limpo!" -ForegroundColor Green
