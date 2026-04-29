package com.examhub.result.repository;

import com.examhub.result.entity.StudentResponse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentResponseRepository extends JpaRepository<StudentResponse, Long> {
    List<StudentResponse> findByResultId(Long resultId);
    List<StudentResponse> findByExamId(Long examId);
}
