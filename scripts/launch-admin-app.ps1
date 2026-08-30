$AppDir = "d:\projects\app\ten"
Set-Location $AppDir

# 1. Test if server is currently responding on port 3000
$isHealthy = $false
try {
    $res = Invoke-WebRequest -Uri "http://localhost:3000/login" -TimeoutSec 3 -UseBasicParsing -ErrorAction SilentlyContinue
    if ($res.StatusCode -eq 200) {
        $isHealthy = $true
    }
} catch {
    $isHealthy = $false
}

# 2. If not running, start server in background and wait for it
if (-not $isHealthy) {
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm.cmd run dev" -WorkingDirectory $AppDir -WindowStyle Hidden

    $attempts = 0
    while (-not $isHealthy -and $attempts -lt 20) {
        Start-Sleep -Seconds 2
        $attempts++
        try {
            $res = Invoke-WebRequest -Uri "http://localhost:3000/login" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
            if ($res.StatusCode -eq 200) {
                $isHealthy = $true
                Write-Host "Server is ready!"
            }
        } catch {
            Write-Host "Waiting for server to initialize ($attempts/20)..."
        }
    }
}

# 3. Launch in Dedicated Native Application Window Mode (No Browser UI / Tabs)
$EdgePaths = @(
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
)

$AppModeOpened = $false
foreach ($exe in $EdgePaths) {
    if (Test-Path $exe) {
        Start-Process -FilePath $exe -ArgumentList "--app=http://localhost:3000/login", "--window-size=1400,900"
        $AppModeOpened = $true
        break
    }
}

if (-not $AppModeOpened) {
    Start-Process "http://localhost:3000/login"
}

Write-Host "The Hayatabad Model School Admin ERP opened successfully in dedicated desktop window!"
