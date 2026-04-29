package com.examhub.result.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "exam_attempts")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExamAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long examId;

    private java.time.LocalDateTime startTime;
    private java.time.LocalDateTime expectedEndTime;
    private Integer durationMinutes;
    private boolean submitted;
}
