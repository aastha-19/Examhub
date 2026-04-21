$services = @("eureka-server", "api-gateway", "auth-service", "exam-service", "result-service")

foreach ($service in $services) {
    Write-Host "Starting $service in a new window..."
    Start-Process powershell -ArgumentList "-NoExit -Command `"cd .\$service; mvn spring-boot:run`""
    Start-Sleep -Seconds 5 # small delay to stagger startup
}

Write-Host "Starting examhub-ng in a new window..."
Start-Process powershell -ArgumentList "-NoExit -Command `"cd .\examhub-ng; npm install; npm start`""

Write-Host "All services and the frontend have been launched in separate windows!"
