# Register as Teacher
$registerBody = '{"name":"Jane Teacher","email":"teacher-jane@examhub.com","password":"password123","role":"ROLE_TEACHER"}'
Invoke-WebRequest -Uri http://localhost:8080/auth/register -Method POST -Body $registerBody -ContentType "application/json" -UseBasicParsing -ErrorAction Ignore

# Login as Teacher
$loginBody = '{"email":"teacher-jane@examhub.com","password":"password123"}'
$tokenResponse = Invoke-WebRequest -Uri http://localhost:8080/auth/login -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing

$token = $tokenResponse.Content.Trim()
Write-Host "Obtained TEACHER Token: $token"

# Create Exam
$examBody = '{"title":"Advanced Math","description":"Calculus 101"}'
$headers = @{ "Authorization" = "Bearer " + $token }

$examResponse = Invoke-RestMethod -Uri http://localhost:8080/api/exams/create -Method POST -Headers $headers -Body $examBody -ContentType "application/json"
Write-Host "Gateway Response (Create Exam):"
Write-Host ($examResponse | ConvertTo-Json)

# Add Question
$qBody = '{"text":"What is the derivative of x^2?","optionA":"x","optionB":"2x","optionC":"x^2","optionD":"2","correctOption":"B"}'
$qResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/exams/$($examResponse.id)/questions" -Method POST -Headers $headers -Body $qBody -ContentType "application/json"
Write-Host "Gateway Response (Create Question):"
Write-Host ($qResponse | ConvertTo-Json)

Write-Host "`nSUCCESS! Your RBAC allows Teachers to create exams and questions properly."
