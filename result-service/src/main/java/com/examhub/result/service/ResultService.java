package com.examhub.result.service;

import com.examhub.result.dto.QuestionDTO;
import com.examhub.result.dto.SubmitExamRequest;
import com.examhub.result.entity.Result;
import com.examhub.result.repository.ResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class ResultService {

    @Autowired
    private ResultRepository resultRepository;

    @Autowired
    private RestTemplate restTemplate;

    public Result submitExam(SubmitExamRequest request) {
        // Fetch exam rules from exam-service
        String examUrl = "http://EXAM-SERVICE/api/exams/" + request.getExamId();
        ResponseEntity<com.examhub.result.dto.ExamDTO> examResponse = restTemplate.getForEntity(examUrl, com.examhub.result.dto.ExamDTO.class);
        com.examhub.result.dto.ExamDTO exam = examResponse.getBody();

        if (exam != null && exam.getExpirationDate() != null) {
            if (java.time.LocalDateTime.now().isAfter(exam.getExpirationDate())) {
                throw new RuntimeException("Exam has expired. Submission rejected!");
            }
        }

        // Fetch questions from exam-service using RestTemplate
        String url = "http://EXAM-SERVICE/api/exams/" + request.getExamId() + "/questions";

        ResponseEntity<List<QuestionDTO>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<QuestionDTO>>() {}
        );

        List<QuestionDTO> questions = response.getBody();

        int correctAnswers = 0;
        int wrongAnswers = 0;
        int unattempted = 0;
        double score = 0.0;
        int totalQuestions = questions != null ? questions.size() : 0;
        
        double positiveMarks = (exam != null && exam.getPositiveMarksPerQuestion() > 0) ? exam.getPositiveMarksPerQuestion() : 1.0;
        double negativeMarks = (exam != null && exam.getNegativeMarksPerQuestion() > 0) ? exam.getNegativeMarksPerQuestion() : 0.0;

        // Auto evaluate
        if (questions != null) {
            for (QuestionDTO question : questions) {
                String submittedAnswer = request.getAnswers().get(question.getId());
                
                if (submittedAnswer == null || submittedAnswer.trim().isEmpty()) {
                    unattempted++;
                } else if (checkAnswerMatch(submittedAnswer, question.getCorrectOption(), question.getQuestionType())) {
                    correctAnswers++;
                    score += positiveMarks;
                } else {
                    wrongAnswers++;
                    score -= negativeMarks;
                }
            }
        }

        // Save result
        Result result = new Result();
        result.setUserId(request.getUserId());
        result.setStudentName(request.getStudentName());
        result.setStudentEmail(request.getStudentEmail());
        result.setExamId(request.getExamId());
        result.setTotalQuestions(totalQuestions);
        result.setCorrectAnswers(correctAnswers);
        result.setWrongAnswers(wrongAnswers);
        result.setUnattempted(unattempted);
        result.setScore(score);

        return resultRepository.save(result);
    }

    private boolean checkAnswerMatch(String submitted, String correct, String questionType) {
        if (submitted == null || correct == null) return false;
        if ("FILL_IN_BLANK".equalsIgnoreCase(questionType)) {
            return submitted.trim().equalsIgnoreCase(correct.trim());
        }
        String[] subParts = submitted.replaceAll("\\s+", "").toUpperCase().split(",");
        String[] corParts = correct.replaceAll("\\s+", "").toUpperCase().split(",");
        java.util.Arrays.sort(subParts);
        java.util.Arrays.sort(corParts);
        return java.util.Arrays.equals(subParts, corParts);
    }

    public List<Result> getResultsByUser(Long userId) {
        return resultRepository.findByUserId(userId);
    }

    public List<Result> getResultsByExam(Long examId) {
        return resultRepository.findByExamId(examId);
    }

    public List<Result> getLeaderboard(Long examId) {
        return resultRepository.findTop10ByExamIdOrderByScoreDesc(examId);
    }

    public java.util.Map<String, Object> getAnalytics(Long examId) {
        Long totalParticipants = resultRepository.countByExamId(examId);
        Double averageScore = resultRepository.getAverageScoreByExamId(examId);
        
        java.util.Map<String, Object> analytics = new java.util.HashMap<>();
        analytics.put("totalParticipants", totalParticipants);
        analytics.put("averageScore", averageScore != null ? Math.round(averageScore * 100.0) / 100.0 : 0.0);
        return analytics;
    }
}
