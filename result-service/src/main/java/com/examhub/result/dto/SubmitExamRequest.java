package com.examhub.result.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubmitExamRequest {
    @NotNull(message = "Exam ID is required")
    private Long examId;
    
    private Long userId; // Will be set securely via Gateway Header
    private String studentName;
    private String studentEmail;
    
    @NotNull(message = "Answers map cannot be null")
    private Map<Long, String> answers;
}
