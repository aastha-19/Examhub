package com.examhub.result.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "student_responses")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long resultId; // Links to the parent Result
    private Long examId;
    private Long questionId;
    
    private String selectedOption;
    private boolean isCorrect;
}
