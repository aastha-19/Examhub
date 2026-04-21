package com.examhub.result.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "results")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId; // Keeping for reference
    private String studentName;
    private String studentEmail;
    
    private Long examId;
    private int totalQuestions;
    private int correctAnswers;
    private int wrongAnswers;
    private int unattempted;
    private double score;
    private java.time.LocalDateTime attemptedAt;
    
    // Anti-Cheating Data
    private int tabSwitches;
}
