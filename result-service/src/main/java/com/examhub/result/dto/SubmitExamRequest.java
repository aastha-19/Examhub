package com.examhub.result.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubmitExamRequest {
    private Long examId;
    private Long userId; // Fallback dummy ID if needed
    private String studentName;
    private String studentEmail;
    
    // Map of questionId -> selectedOption (e.g. "A", "B", "C", "D")
    private Map<Long, String> answers;
}
