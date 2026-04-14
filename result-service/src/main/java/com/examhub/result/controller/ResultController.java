package com.examhub.result.controller;

import com.examhub.result.dto.SubmitExamRequest;
import com.examhub.result.entity.Result;
import com.examhub.result.service.ResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/results")
public class ResultController {

    @Autowired
    private ResultService resultService;

    // Student: Submit exam answers
    @PostMapping("/submit")
    public Result submitExam(
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) Long userIdHeader,
            @Valid @RequestBody SubmitExamRequest request) {
        
        if (!"ROLE_STUDENT".equals(role)) {
            throw new RuntimeException("Unauthorized: Only Students can submit exams");
        }
        
        // Enhance security: Override payload userId with Gateway header userId
        if (userIdHeader != null) {
            request.setUserId(userIdHeader);
        }
        
        return resultService.submitExam(request);
    }

    // Student: Get own results
    @GetMapping("/user/{userId}")
    public List<Result> getUserResults(
            @RequestHeader(value = "X-User-Id", required = false) Long loggedInUserId,
            @PathVariable Long userId) {
        
        // Prevent student from viewing other students' results
        if (loggedInUserId != null && !loggedInUserId.equals(userId)) {
            throw new RuntimeException("Unauthorized: Cannot view another user's results");
        }
        return resultService.getResultsByUser(userId);
    }

    // Admin/Teacher: Get all results for a specific exam
    @GetMapping("/exam/{examId}")
    public List<Result> getExamResults(
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @PathVariable Long examId) {
        
        if (!"ROLE_TEACHER".equals(role) && !"ROLE_ADMIN".equals(role)) {
            throw new RuntimeException("Unauthorized: Only Teachers can view all exam results");
        }
        return resultService.getResultsByExam(examId);
    }

    // All Users: View Leaderboard
    @GetMapping("/exam/{examId}/leaderboard")
    public List<Result> getLeaderboard(@PathVariable Long examId) {
        return resultService.getLeaderboard(examId);
    }

    // Teachers: View Analytics
    @GetMapping("/exam/{examId}/analytics")
    public java.util.Map<String, Object> getAnalytics(
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @PathVariable Long examId) {
        if (!"ROLE_TEACHER".equals(role) && !"ROLE_ADMIN".equals(role)) {
            throw new RuntimeException("Unauthorized: Only Teachers can view analytics");
        }
        return resultService.getAnalytics(examId);
    }
}
