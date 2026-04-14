$services = @("eureka-server", "api-gateway", "auth-service", "exam-service", "result-service")

foreach ($service in $services) {
    Write-Host "Starting $service in a new window..."
    Start-Process powershell -ArgumentList "-NoExit -Command `"cd .\$service; mvn spring-boot:run`""
    Start-Sleep -Seconds 5 # small delay to stagger startup
}
Write-Host "All services have been launched in separate windows!"
