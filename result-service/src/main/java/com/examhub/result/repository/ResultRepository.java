package com.examhub.result.repository;

import com.examhub.result.entity.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface ResultRepository extends JpaRepository<Result, Long> {
    List<Result> findByUserId(Long userId);
    List<Result> findByExamId(Long examId);
    
    // Leaderboard
    List<Result> findTop10ByExamIdOrderByScoreDesc(Long examId);
    
    // Analytics
    Long countByExamId(Long examId);
    
    @Query("SELECT AVG(r.score) FROM Result r WHERE r.examId = :examId")
    Double getAverageScoreByExamId(@Param("examId") Long examId);
}
