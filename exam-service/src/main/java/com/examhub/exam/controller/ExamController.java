package com.examhub.exam.controller;

import com.examhub.exam.entity.Exam;
import com.examhub.exam.entity.Question;
import com.examhub.exam.service.ExamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
public class ExamController {

    @Autowired
    private ExamService examService;

    // Admin: Create new exam
    @PostMapping("/create")
    public Exam createExam(@RequestBody Exam exam) {
        return examService.createExam(exam);
    }

    // Admin: Add question to an exam
    @PostMapping("/{examId}/questions")
    public Question addQuestion(@PathVariable Long examId, @RequestBody Question question) {
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
    public org.springframework.http.ResponseEntity<String> uploadQuestionImage(@PathVariable Long questionId, @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            String imageUrl = examService.uploadQuestionImage(questionId, file);
            return org.springframework.http.ResponseEntity.ok(imageUrl);
        } catch (java.io.IOException e) {
            return org.springframework.http.ResponseEntity.internalServerError().body("Failed to upload image");
        }
    }

    // Admin/Teacher: Delete Exam
    @DeleteMapping("/{examId}")
    public org.springframework.http.ResponseEntity<String> deleteExam(@PathVariable Long examId) {
        try {
            examService.deleteExam(examId);
            return org.springframework.http.ResponseEntity.ok("Exam deleted successfully");
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
