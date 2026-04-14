$body = '{"title": "Java Basics", "description": "Basic Java"}'
try {
    $response = Invoke-WebRequest -Uri http://localhost:8082/api/exams/create -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    Write-Host "Success!"
    Write-Host $response.Content
} catch {
    Write-Host "Error!"
    Write-Host $_.Exception.ToString()
    Write-Host $_.Exception.Response.StatusCode.value__
}
