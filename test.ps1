# 1. Login as Teacher to get token
$loginBody = '{"email":"teacher-jane@examhub.com","password":"password123"}'
try {
    $tokenResponse = Invoke-WebRequest -Uri http://localhost:8080/auth/login -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing
    $token = $tokenResponse.Content.Trim()
    Write-Host "Obtained Token: $token"
} catch {
    Write-Host "Login failed. Make sure you ran test-teacher.ps1 first to register the user."
    exit
}

# 2. Create Exam via Gateway
$examBody = '{"title": "Java Basics", "description": "Basic Java terminology"}'
$headers = @{ "Authorization" = "Bearer $token" }

try {
    $response = Invoke-RestMethod -Uri http://localhost:8080/api/exams/create -Method POST -Headers $headers -Body $examBody -ContentType "application/json"
    Write-Host "Success! Created Exam with ID: $($response.id)"
    Write-Host ($response | ConvertTo-Json)
} catch {
    Write-Host "Error creating exam!"
    Write-Host $_.Exception.ToString()
}
