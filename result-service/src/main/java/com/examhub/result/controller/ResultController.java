package com.examhub.result.controller;

import com.examhub.result.dto.SubmitExamRequest;
import com.examhub.result.entity.Result;
import com.examhub.result.service.ResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/results")
public class ResultController {

    @Autowired
    private ResultService resultService;

    // Student: Submit exam answers
    @PostMapping("/submit")
    public Result submitExam(@RequestBody SubmitExamRequest request) {
        return resultService.submitExam(request);
    }

    // Student: Get own results
    @GetMapping("/user/{userId}")
    public List<Result> getUserResults(@PathVariable Long userId) {
        return resultService.getResultsByUser(userId);
    }

    // Admin/Teacher: Get all results for a specific exam
    @GetMapping("/exam/{examId}")
    public List<Result> getExamResults(@PathVariable Long examId) {
        return resultService.getResultsByExam(examId);
    }
}
