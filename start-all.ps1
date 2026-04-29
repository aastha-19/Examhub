$services = @("eureka-server", "api-gateway", "auth-service", "exam-service", "result-service")

# 1. Start Eureka Server first
Write-Host "Starting eureka-server..."
Start-Process powershell -ArgumentList "-NoExit -Command `"cd .\eureka-server; mvn clean compile spring-boot:run`""

# 2. Wait for Eureka to be healthy
Write-Host "Waiting for Eureka Server to be ready at http://localhost:8761 ..."
$ready = $false
while (-not $ready) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8761" -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) { $ready = $true }
    } catch {
        Start-Sleep -Seconds 2
    }
}
Write-Host "Eureka Server is UP! Starting other services..."

# 3. Start other backend services
$remainingServices = @("api-gateway", "auth-service", "exam-service", "result-service")
foreach ($service in $remainingServices) {
    Write-Host "Starting $service..."
    Start-Process powershell -ArgumentList "-NoExit -Command `"cd .\$service; mvn clean compile spring-boot:run`""
    Start-Sleep -Seconds 3 # small delay between services
}

# 4. Start Frontend
Write-Host "Starting examhub-ng..."
Start-Process powershell -ArgumentList "-NoExit -Command `"cd .\examhub-ng; npm install; npm start`""

Write-Host "`nAll systems launched! Check http://localhost:8761 for registration status."
