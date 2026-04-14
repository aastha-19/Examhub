$loginBody = '{"username":"student1","password":"password123"}'
$tokenResponse = Invoke-WebRequest -Uri http://localhost:8080/auth/login -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing

$token = $tokenResponse.Content.Trim()
Write-Host "Obtained Token: $token"

$examBody = '{"title":"Java Basics","description":"Testing Gateway"}'
$headers = @{
    "Authorization" = "Bearer " + $token
}

try {
    $examResponse = Invoke-WebRequest -Uri http://localhost:8080/api/exams/create -Method POST -Headers $headers -Body $examBody -ContentType "application/json" -UseBasicParsing
    Write-Host "Gateway Response:"
    Write-Host $examResponse.Content
} catch {
    Write-Host "Gateway Failed!"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        Write-Host "Status Code: " $_.Exception.Response.StatusCode
    }
}
