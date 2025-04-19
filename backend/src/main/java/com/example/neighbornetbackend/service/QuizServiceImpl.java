package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.dto.*;
import com.example.neighbornetbackend.exception.ResourceNotFoundException;
import com.example.neighbornetbackend.exception.UnauthorizedException;
import com.example.neighbornetbackend.model.*;
import com.example.neighbornetbackend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class QuizServiceImpl implements QuizService {
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final ClassRepository classRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;

    public QuizServiceImpl(
            QuizRepository quizRepository,
            QuestionRepository questionRepository,
            QuizAttemptRepository quizAttemptRepository,
            ClassRepository classRepository,
            UserRepository userRepository,
            ActivityService activityService) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.classRepository = classRepository;
        this.userRepository = userRepository;
        this.activityService = activityService;
    }

    @Override
    @Transactional
    public QuizResponse createQuiz(Long classId, QuizRequest request, Long userId) {
        CourseClass courseClass = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

        if (!courseClass.getCreator().getId().equals(userId)) {
            throw new UnauthorizedException("Not authorized to create quiz for this class");
        }

        Quiz quiz = new Quiz();
        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setTimeLimit(request.getTimeLimit());
        quiz.setPassingScore(request.getPassingScore());
        quiz.setClassEntity(courseClass);

        Quiz savedQuiz = quizRepository.save(quiz);

        List<Question> questions = request.getQuestions().stream().map(questionRequest -> {
            Question question = new Question();
            question.setContent(questionRequest.getContent());
            question.setType(questionRequest.getType());
            question.setPoints(questionRequest.getPoints());
            question.setQuiz(savedQuiz);

            QuestionData questionData = new QuestionData();
            questionData.setOptions(questionRequest.getOptions());
            questionData.setCorrectAnswer(questionRequest.getCorrectAnswer());
            questionData.setExplanation(questionRequest.getExplanation());
            questionData.setMinWords(questionRequest.getMinWords());
            questionData.setMaxWords(questionRequest.getMaxWords());
            question.setQuestionData(questionData);

            return question;
        }).collect(Collectors.toList());

        questionRepository.saveAll(questions);

        CompletableFuture.runAsync(() -> {
            activityService.trackActivity(
                    userId,
                    "quiz_created",
                    "Created a new quiz",
                    savedQuiz.getTitle(),
                    "ClipboardCheck",
                    savedQuiz.getId()
            );
        });

        return QuizResponse.fromEntity(savedQuiz);
    }

    @Override
    public QuizResponse getQuiz(Long quizId, Long userId) {
        Quiz quiz = quizRepository.findByIdWithQuestions(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));

        CourseClass courseClass = quiz.getClassEntity();
        boolean isCreator = courseClass.getCreator().getId().equals(userId);

        if (!isCreator) {
            boolean isEnrolled = courseClass.getEnrollments().stream()
                    .anyMatch(enrollment -> enrollment.getUser().getId().equals(userId));

            if (!isEnrolled) {
                throw new UnauthorizedException("Not authorized to view this quiz");
            }
        }

        return QuizResponse.fromEntity(quiz);
    }

    @Override
    public List<QuizResponse> getQuizzesByClass(Long classId) {
        CourseClass courseClass = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

        return quizRepository.findByClassEntity_Id(classId)
                .stream()
                .map(QuizResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public QuizResponse updateQuiz(Long quizId, QuizRequest request, Long userId) {
        return null;
    }

    @Override
    public void deleteQuiz(Long quizId, Long userId) {

    }

    @Override
    public QuizAttemptResponse startQuizAttempt(Long quizId, Long userId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuiz(quiz);
        attempt.setUser(user);
        attempt.setStartedAt(LocalDateTime.now());

        QuizAttempt savedAttempt = quizAttemptRepository.save(attempt);

        activityService.trackActivity(
                userId,
                "quiz_started",
                "Started a quiz attempt",
                quiz.getTitle(),
                "PlayCircle",
                quizId
        );

        return QuizAttemptResponse.fromEntity(savedAttempt, false);
    }

    @Override
    @Transactional
    public QuizAttemptResponse submitQuizAttempt(Long quizId, Long attemptId, QuizAttemptRequest request, Long userId) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));

        if (!attempt.getQuiz().getId().equals(quizId) || !attempt.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Not authorized to submit this attempt");
        }

        if (attempt.getCompletedAt() != null) {
            throw new RuntimeException("This attempt has already been submitted");
        }

        // Calculate score
        int score = 0;
        int maxScore = 0;
        Map<String, String> correctAnswers = new HashMap<>();
        Map<String, String> explanations = new HashMap<>();

        for (Question question : attempt.getQuiz().getQuestions()) {
            String userAnswer = request.getAnswers().get(question.getId().toString());
            String correctAnswer = question.getQuestionData().getCorrectAnswer();
            maxScore += question.getPoints();

            if (userAnswer != null) {
                if (question.getType() == Question.QuestionType.ESSAY) {
                    score += question.getPoints();
                } else if (userAnswer.equalsIgnoreCase(correctAnswer)) {
                    score += question.getPoints();
                }
            }

            correctAnswers.put(question.getId().toString(), correctAnswer);
            if (question.getQuestionData().getExplanation() != null) {
                explanations.put(question.getId().toString(), question.getQuestionData().getExplanation());
            }
        }

        attempt.setScore(score);
        attempt.setMaxScore(maxScore);
        attempt.setPassed(score >= attempt.getQuiz().getPassingScore());
        attempt.setAnswers(request.getAnswers());
        attempt.setCompletedAt(LocalDateTime.now());

        QuizAttempt savedAttempt = quizAttemptRepository.save(attempt);
        QuizAttemptResponse response = QuizAttemptResponse.fromEntity(savedAttempt, true);
        response.setCorrectAnswers(correctAnswers);
        response.setExplanations(explanations);

        activityService.trackActivity(
                userId,
                "quiz_completed",
                "Completed a quiz attempt",
                attempt.getQuiz().getTitle(),
                "CheckCircle",
                quizId
        );

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizAttemptResponse> getQuizAttempts(Long quizId, Long userId) {
        return quizAttemptRepository.findByQuizIdAndUserIdOrderByStartedAtDesc(quizId, userId)
                .stream()
                .map(attempt -> QuizAttemptResponse.fromEntity(attempt, true))
                .collect(Collectors.toList());
    }
}