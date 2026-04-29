package com.examhub.exam.service;

import com.examhub.exam.entity.Exam;
import com.examhub.exam.entity.Question;
import com.examhub.exam.repository.ExamRepository;
import com.examhub.exam.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
public class ExamService {

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private QuestionRepository questionRepository;
    
    @Autowired
    private com.examhub.exam.repository.BookmarkRepository bookmarkRepository;

    public Exam createExam(Exam exam) {
        return examRepository.save(exam);
    }

    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }

    public List<Exam> getExamsByClass(String className) {
        return examRepository.findByTargetClass(className);
    }

    public Exam getExamById(Long id) {
        return examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
    }

    public Question addQuestionToExam(Long examId, Question question) {
        Exam exam = getExamById(examId);
        question.setExam(exam);
        return questionRepository.save(question);
    }

    public List<Question> getQuestionsForExam(Long examId) {
        return questionRepository.findByExamId(examId);
    }

    public String uploadQuestionImage(Long questionId, MultipartFile file) throws IOException {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        String uploadsDir = "uploads/";
        Path uploadPath = Paths.get(uploadsDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        String imageUrl = "http://localhost:8082/uploads/" + fileName;
        question.setImageUrl(imageUrl);
        questionRepository.save(question);

        return imageUrl;
    }

    public void deleteExam(Long id) {
        if (!examRepository.existsById(id)) {
            throw new RuntimeException("Exam not found");
        }
        bookmarkRepository.deleteByExamId(id);
        examRepository.deleteById(id);
    }

    public com.examhub.exam.entity.Bookmark toggleBookmark(Long userId, Long examId, Long questionId) {
        java.util.Optional<com.examhub.exam.entity.Bookmark> existing = bookmarkRepository.findByUserIdAndQuestionId(userId, questionId);
        if (existing.isPresent()) {
            bookmarkRepository.delete(existing.get());
            return null;
        } else {
            com.examhub.exam.entity.Bookmark b = new com.examhub.exam.entity.Bookmark();
            b.setUserId(userId);
            b.setExamId(examId);
            b.setQuestionId(questionId);
            b.setBookmarkedAt(java.time.LocalDateTime.now());
            return bookmarkRepository.save(b);
        }
    }

    public List<com.examhub.exam.entity.Bookmark> getUserBookmarks(Long userId) {
        return bookmarkRepository.findByUserId(userId);
    }
}
