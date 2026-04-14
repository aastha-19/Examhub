# ExamHub Microservices Project

ExamHub is an online exam system built with Spring Boot and Spring Cloud Microservices Architecture.

## Architecture & Services
1. **Eureka Server** (`8761`): Service Registry.
2. **API Gateway** (`8080`): Central entry point to the system, validates JWT tokens.
3. **Auth Service** (`8081`): Manages user registration and login (generates JWTs). connects to `examhub_auth`.
4. **Exam Service** (`8082`): Manages exams and questions. connects to `examhub_exam`.
5. **Result Service** (`8083`): Evaluates exams. connects to `examhub_result`.

## Prerequisites / Necessities
- **Java 17+** (Backend microservices)
- **Maven** (Backend dependencies)
- **MySQL** (Database)
- **Node.js (v18+) & npm** (To run the React frontend)
- **Git** (For version control)

## Setup Instructions

### 1. Database Creation
Open MySQL shell or Workbench and run:
```sql
CREATE DATABASE examhub_auth;
CREATE DATABASE examhub_exam;
CREATE DATABASE examhub_result;
```
Ensure your MySQL credentials are `root` / `root` on `localhost:3306`, or update `application.properties` in each service. The tables will be auto-created by Hibernate.

### 2. Build the Project
In each folder (`eureka-server`, `api-gateway`, `auth-service`, `exam-service`, `result-service`), run:
```bash
mvn clean install
```

### 3. Run the Services
Run each service in this specific order:
1. Eureka Server: `mvn spring-boot:run`
2. API Gateway
3. Auth Service
4. Exam Service
5. Result Service

Check `http://localhost:8761` to verify all services are registered with Eureka.

## Postman API Examples

> [!NOTE]
> For all requests except Auth, pass the JWT token in the `Authorization` header as `Bearer <token>`.

### 1. Register User (Auth Service)
**POST** `http://localhost:8080/auth/register`
```json
{
    "username": "student1",
    "password": "password123",
    "role": "ROLE_STUDENT"
}
```

### 2. Login User (Auth Service)
**POST** `http://localhost:8080/auth/login`
```json
{
    "username": "student1",
    "password": "password123"
}
```
*Response will be your raw JWT token string.* Keep this token for further requests.

### 3. Create Exam (Exam Service - API Gateway)
**POST** `http://localhost:8080/api/exams/create`
**Headers**: `Authorization: Bearer <TOKEN>`
```json
{
    "title": "Java Basics",
    "description": "Basic Java terminology and concepts"
}
```

### 4. Add Question to Exam (Exam Service)
**POST** `http://localhost:8080/api/exams/{exam_id}/questions`
**Headers**: `Authorization: Bearer <TOKEN>`
```json
{
    "text": "What is JVM?",
    "optionA": "Java Viral Machine",
    "optionB": "Java Virtual Machine",
    "optionC": "Java Visual Machine",
    "optionD": "None",
    "correctOption": "B"
}
```

### 5. Submit Exam (Result Service)
**POST** `http://localhost:8080/api/results/submit`
**Headers**: `Authorization: Bearer <TOKEN>`
```json
{
    "examId": 1,
    "userId": 1,
    "answers": {
        "1": "B"
    }
}
```
