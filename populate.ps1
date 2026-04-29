$baseUrl = "http://localhost:8080"
$email = "aastha@ddn.in"
$password = "@aastha1"

# 1. Login to get token
Write-Host "Logging in..."
$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $token = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "Login successful."
} catch {
    Write-Host "Login failed, attempting to register..."
    # Register the user if login fails (assuming user doesn't exist yet)
    $registerBody = @{
        name = "Aastha"
        email = $email
        password = $password
        role = "ROLE_TEACHER"
        sapid = "12345"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "Registration successful. Logging in again..."
    
    $token = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "Login successful."
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json"
}

# Define subjects and questions
$examsData = @(
    @{
        title = "Mathematics Exam 1"
        description = "Basic Algebra and Geometry"
        subject = "Mathematics"
        questions = @(
            @{ text="What is x if 2x = 10?"; optionA="2"; optionB="3"; optionC="4"; optionD="5"; correctOption="D" },
            @{ text="Calculate the area of a square with side 4."; optionA="8"; optionB="12"; optionC="16"; optionD="20"; correctOption="C" },
            @{ text="What is the value of Pi to two decimal places?"; optionA="3.12"; optionB="3.14"; optionC="3.16"; optionD="3.18"; correctOption="B" },
            @{ text="What is 5 cubed?"; optionA="25"; optionB="125"; optionC="625"; optionD="15"; correctOption="B" },
            @{ text="Solve: 15 - 3 * 2"; optionA="24"; optionB="9"; optionC="12"; optionD="6"; correctOption="B" }
        )
    },
    @{
        title = "Science Fundamentals"
        description = "Basic Physics and Biology"
        subject = "Science"
        questions = @(
            @{ text="What is the chemical symbol for water?"; optionA="H2O"; optionB="CO2"; optionC="O2"; optionD="NaCl"; correctOption="A" },
            @{ text="Which planet is known as the Red Planet?"; optionA="Venus"; optionB="Jupiter"; optionC="Mars"; optionD="Saturn"; correctOption="C" },
            @{ text="What is the powerhouse of the cell?"; optionA="Nucleus"; optionB="Ribosome"; optionC="Mitochondria"; optionD="Endoplasmic Reticulum"; correctOption="C" },
            @{ text="What gas do plants absorb during photosynthesis?"; optionA="Oxygen"; optionB="Nitrogen"; optionC="Carbon Dioxide"; optionD="Hydrogen"; correctOption="C" },
            @{ text="How many bones are in the adult human body?"; optionA="201"; optionB="206"; optionC="212"; optionD="216"; correctOption="B" }
        )
    },
    @{
        title = "History Quiz"
        description = "World History 101"
        subject = "History"
        questions = @(
            @{ text="Who was the first President of the United States?"; optionA="Abraham Lincoln"; optionB="George Washington"; optionC="Thomas Jefferson"; optionD="John Adams"; correctOption="B" },
            @{ text="In which year did World War II end?"; optionA="1940"; optionB="1945"; optionC="1950"; optionD="1960"; correctOption="B" },
            @{ text="Who discovered America in 1492?"; optionA="Leif Erikson"; optionB="Amerigo Vespucci"; optionC="Christopher Columbus"; optionD="Ferdinand Magellan"; correctOption="C" },
            @{ text="Which ancient civilization built the pyramids?"; optionA="Romans"; optionB="Greeks"; optionC="Mesopotamians"; optionD="Egyptians"; correctOption="D" },
            @{ text="Who wrote the Declaration of Independence?"; optionA="Alexander Hamilton"; optionB="James Madison"; optionC="Thomas Jefferson"; optionD="Benjamin Franklin"; correctOption="C" }
        )
    }
)

foreach ($exam in $examsData) {
    Write-Host "Creating exam: $($exam.title)..."
    $examPayload = @{
        title = $exam.title
        description = $exam.description
        subject = $exam.subject
    } | ConvertTo-Json

    $createdExam = Invoke-RestMethod -Uri "$baseUrl/api/exams/create" -Method Post -Body $examPayload -Headers $headers
    
    $examId = $createdExam.id

    Write-Host "Created Exam ID: $examId. Adding questions..."
    foreach ($q in $exam.questions) {
        $qPayload = $q | ConvertTo-Json
        Invoke-RestMethod -Uri "$baseUrl/api/exams/$examId/questions" -Method Post -Body $qPayload -Headers $headers | Out-Null
    }
    Write-Host "Added 5 questions to $($exam.title)."
}

Write-Host "All test cases generated successfully!"
