package com.examhub.exam.entity;

import jakarta.validation.constraints.NotBlank;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "questions")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Question text is required")
    private String text;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    
    private String questionType = "MULTIPLE_CHOICE"; // MULTIPLE_CHOICE, TRUE_FALSE, FILL_IN_BLANK
    @NotBlank(message = "Correct option is required")
    private String correctOption; // e.g. "A", "B", "C", "D" or exact string for fill-in-the-blank
    private String imageUrl;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id")
    @JsonIgnore
    private Exam exam;
}
