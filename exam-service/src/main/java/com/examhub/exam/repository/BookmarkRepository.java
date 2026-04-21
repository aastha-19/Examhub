package com.examhub.exam.repository;

import com.examhub.exam.entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    List<Bookmark> findByUserId(Long userId);
    List<Bookmark> findByUserIdAndExamId(Long userId, Long examId);
    Optional<Bookmark> findByUserIdAndQuestionId(Long userId, Long questionId);

    @org.springframework.transaction.annotation.Transactional
    void deleteByExamId(Long examId);
}
