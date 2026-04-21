package com.examhub.exam.controller;

import com.examhub.exam.entity.Exam;
import com.examhub.exam.entity.Question;
import com.examhub.exam.service.ExamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/exams")
public class ExamController {

    @Autowired
    private ExamService examService;

    // Admin/Teacher: Create new exam
    @PostMapping("/create")
    public Exam createExam(@RequestHeader(value = "X-User-Role", required = false) String role,
            @Valid @RequestBody Exam exam) {
        if (!"ROLE_TEACHER".equals(role) && !"ROLE_ADMIN".equals(role)) {
            throw new RuntimeException("Unauthorized: Only Teachers can create exams");
        }
        return examService.createExam(exam);
    }

    // Admin/Teacher: Add question to an exam
    @PostMapping("/{examId}/questions")
    public Question addQuestion(@RequestHeader(value = "X-User-Role", required = false) String role,
            @PathVariable Long examId, @Valid @RequestBody Question question) {
        if (!"ROLE_TEACHER".equals(role) && !"ROLE_ADMIN".equals(role)) {
            throw new RuntimeException("Unauthorized: Only Teachers can add questions");
        }
        return examService.addQuestionToExam(examId, question);
    }

    // Student/Admin: View all exams
    @GetMapping
    public List<Exam> getAllExams() {
        return examService.getAllExams();
    }

    // Student/Admin: Get a specific exam details
    @GetMapping("/{examId}")
    public Exam getExam(@PathVariable Long examId) {
        return examService.getExamById(examId);
    }

    // Student: Get all questions for an exam
    @GetMapping("/{examId}/questions")
    public List<Question> getExamQuestions(@PathVariable Long examId) {
        return examService.getQuestionsForExam(examId);
    }

    // Admin/Teacher: Upload image for a question
    @PostMapping("/questions/{questionId}/image")
    public org.springframework.http.ResponseEntity<String> uploadQuestionImage(
            @RequestHeader(value = "X-User-Role", required = false) String role, @PathVariable Long questionId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        if (!"ROLE_TEACHER".equals(role) && !"ROLE_ADMIN".equals(role)) {
            return org.springframework.http.ResponseEntity.status(403)
                    .body("Unauthorized: Only Teachers can upload images");
        }
        try {
            String imageUrl = examService.uploadQuestionImage(questionId, file);
            return org.springframework.http.ResponseEntity.ok(imageUrl);
        } catch (java.io.IOException e) {
            return org.springframework.http.ResponseEntity.internalServerError().body("Failed to upload image");
        }
    }

    // Admin/Teacher: Delete Exam
    @DeleteMapping("/{examId}")
    public org.springframework.http.ResponseEntity<String> deleteExam(
            @RequestHeader(value = "X-User-Role", required = false) String role, @PathVariable Long examId) {
        if (!"ROLE_TEACHER".equals(role) && !"ROLE_ADMIN".equals(role)) {
            return org.springframework.http.ResponseEntity.status(403)
                    .body("Unauthorized: Only Teachers can delete exams");
        }
        try {
            examService.deleteExam(examId);
            return org.springframework.http.ResponseEntity.ok("Exam deleted successfully");
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Student: Toggle Bookmark on Question
    @PostMapping("/bookmarks/{examId}/questions/{questionId}")
    public org.springframework.http.ResponseEntity<?> toggleBookmark(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long examId,
            @PathVariable Long questionId) {
        if (userId == null) {
            return org.springframework.http.ResponseEntity.status(401).body("User ID is missing in headers");
        }
        com.examhub.exam.entity.Bookmark b = examService.toggleBookmark(userId, examId, questionId);
        return org.springframework.http.ResponseEntity.ok(b == null ? "Bookmark removed" : b);
    }

    // Student: Get All Bookmarks
    @GetMapping("/bookmarks")
    public java.util.List<com.examhub.exam.entity.Bookmark> getBookmarks(
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) {
            throw new RuntimeException("User ID is missing in headers");
        }
        return examService.getUserBookmarks(userId);
    }
}
