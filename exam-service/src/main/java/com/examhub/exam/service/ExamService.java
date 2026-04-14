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

    public Exam createExam(Exam exam) {
        return examRepository.save(exam);
    }

    public List<Exam> getAllExams() {
        return examRepository.findAll();
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
        examRepository.deleteById(id);
    }
}
