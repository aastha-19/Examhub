package com.examhub.result.repository;

import com.examhub.result.entity.ExamAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {
    Optional<ExamAttempt> findByUserIdAndExamId(Long userId, Long examId);
}
