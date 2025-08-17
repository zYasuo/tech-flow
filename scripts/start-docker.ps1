# Script para iniciar o Docker Desktop no Windows
Write-Host "Iniciando Docker Desktop..." -ForegroundColor Green

# Verificar se o Docker Desktop ja esta rodando
docker info 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Docker ja esta rodando!" -ForegroundColor Green
    exit 0
}

# Tentar iniciar o Docker Desktop
Write-Host "Iniciando Docker Desktop..." -ForegroundColor Yellow

# Caminhos possiveis do Docker Desktop
$dockerPaths = @(
    "C:\Program Files\Docker\Docker\Docker Desktop.exe",
    "${env:ProgramFiles}\Docker\Docker\Docker Desktop.exe",
    "${env:ProgramFiles(x86)}\Docker\Docker\Docker Desktop.exe"
)

$dockerStarted = $false
foreach ($path in $dockerPaths) {
    if (Test-Path $path) {
        Write-Host "Encontrado Docker Desktop em: $path" -ForegroundColor Cyan
        Start-Process -FilePath $path -WindowStyle Minimized
        $dockerStarted = $true
        break
    }
}

if (-not $dockerStarted) {
    Write-Host "Docker Desktop nao encontrado!" -ForegroundColor Red
    Write-Host "Instale o Docker Desktop em: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    exit 1
}

# Aguardar o Docker inicializar
Write-Host "Aguardando Docker inicializar..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0

while ($attempt -lt $maxAttempts) {
    docker info 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Docker Desktop iniciado com sucesso!" -ForegroundColor Green
        exit 0
    }
    
    $attempt++
    Write-Host "Tentativa $attempt/$maxAttempts..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
}

Write-Host "Timeout: Docker nao conseguiu inicializar em 60 segundos" -ForegroundColor Red
Write-Host "Verifique se o Docker Desktop foi instalado corretamente" -ForegroundColor Yellow
exit 1
