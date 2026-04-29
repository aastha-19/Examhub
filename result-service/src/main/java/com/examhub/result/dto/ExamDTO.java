package com.examhub.result.dto;

import java.time.LocalDateTime;

public class ExamDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime expirationDate;
    private int durationMinutes;
    private double positiveMarksPerQuestion;
    private double negativeMarksPerQuestion;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getExpirationDate() {
        return expirationDate;
    }

    public void setExpirationDate(LocalDateTime expirationDate) {
        this.expirationDate = expirationDate;
    }

    public int getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(int durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public double getPositiveMarksPerQuestion() {
        return positiveMarksPerQuestion;
    }

    public void setPositiveMarksPerQuestion(double positiveMarksPerQuestion) {
        this.positiveMarksPerQuestion = positiveMarksPerQuestion;
    }

    public double getNegativeMarksPerQuestion() {
        return negativeMarksPerQuestion;
    }

    public void setNegativeMarksPerQuestion(double negativeMarksPerQuestion) {
        this.negativeMarksPerQuestion = negativeMarksPerQuestion;
    }
}
