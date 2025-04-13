package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.dto.QuestionRequest;
import com.example.neighbornetbackend.dto.QuizGenerationRequest;
import com.example.neighbornetbackend.dto.QuizRequest;
import com.example.neighbornetbackend.model.Question;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class LocalQuizGenerator {

    public QuizRequest generateLocalQuiz(QuizGenerationRequest request) {
        QuizRequest quiz = new QuizRequest();
        String topic = request.getTopic();

        // Set basic quiz information
        quiz.setTitle("Quiz on " + topic);
        quiz.setDescription("A " + request.getDifficulty() + " level quiz about " + topic);

        List<QuestionRequest> questions = new ArrayList<>();

        // Generate questions based on the topic
        addQuestionsBasedOnTopic(questions, topic, request.getQuizType(), request.getNumberOfQuestions(), request.getDifficulty());

        quiz.setQuestions(questions);
        return quiz;
    }

    public void addQuestionsBasedOnTopic(List<QuestionRequest> questions, String topic,
                                         String quizType, int numberOfQuestions, String difficulty) {
        // Basic templates for different question types
        String[][] multipleChoiceTemplates = {
                // Question, Option 1 (Correct), Option 2, Option 3, Option 4, Explanation
                {"What is the main focus of %s?",
                        "Understanding key concepts", "Memorizing dates", "Only practical applications", "None of the above",
                        "The main focus typically involves understanding the fundamental concepts and principles."},

                {"Which of these is most closely associated with %s?",
                        "Core principles and methodologies", "Unrelated concepts", "Opposite theories", "Random facts",
                        "Core principles and methodologies are fundamental to understanding any subject."},

                {"In %s studies, what approach is commonly used?",
                        "Systematic analysis", "Random guessing", "Ignoring evidence", "Avoiding research",
                        "A systematic analysis is essential to properly understand and work with the topic."},

                {"What is a key benefit of learning about %s?",
                        "Expanded knowledge and applications", "No practical use", "Limited perspective", "Decreased understanding",
                        "Learning about any topic expands one's knowledge base and opens up new applications."},

                {"Which statement about %s is most accurate?",
                        "It requires ongoing learning and adaptation", "It never changes", "It's irrelevant today", "It has no structure",
                        "Most fields require continuous learning as knowledge and applications evolve over time."}
        };

        String[][] trueFalseTemplates = {
                // Question, Correct Answer, Explanation
                {"%s is a field that continues to evolve with new discoveries.", "True",
                        "Most academic and practical fields evolve as new research and applications emerge."},

                {"%s has remained completely unchanged for the past century.", "False",
                        "Few if any fields remain completely static as research and applications develop."},

                {"Understanding %s requires both theoretical knowledge and practical application.", "True",
                        "Most subjects benefit from both theoretical understanding and practical implementation."},

                {"%s is only relevant in specific geographical regions.", "False",
                        "Most fields of study have global relevance, though applications may vary."},

                {"Research in %s is considered complete with no new developments expected.", "False",
                        "Research continues in virtually all fields, with new developments regularly emerging."}
        };

        String[] essayTemplates = {
                "Explain the fundamental principles of %s and how they apply in real-world scenarios.",
                "Compare and contrast different approaches to understanding %s.",
                "Analyze the historical development of %s and its significance today.",
                "Discuss the ethical considerations related to %s in contemporary society.",
                "Evaluate the impact of recent developments in %s on related fields of study."
        };

        // Determine how many of each type to create
        int mcCount = 0, tfCount = 0, essayCount = 0;

        if ("multiple-choice".equals(quizType)) {
            mcCount = numberOfQuestions;
        } else if ("true-false".equals(quizType)) {
            tfCount = numberOfQuestions;
        } else if ("essay".equals(quizType)) {
            essayCount = numberOfQuestions;
        } else {
            // Mixed type - distribute questions
            mcCount = numberOfQuestions / 2;
            tfCount = numberOfQuestions / 4;
            essayCount = numberOfQuestions - mcCount - tfCount;
        }

        // Generate multiple choice questions
        for (int i = 0; i < mcCount; i++) {
            String[] template = multipleChoiceTemplates[i % multipleChoiceTemplates.length];
            QuestionRequest question = new QuestionRequest();
            question.setContent(String.format(template[0], topic));
            question.setType(Question.QuestionType.MULTIPLE_CHOICE);

            List<String> options = new ArrayList<>();
            options.add(template[1]); // Correct answer
            options.add(template[2]);
            options.add(template[3]);
            options.add(template[4]);
            question.setOptions(options);

            question.setCorrectAnswer(template[1]);
            question.setExplanation(template[5]);
            question.setPoints("easy".equals(difficulty) ? 1 : "medium".equals(difficulty) ? 2 : 3);

            questions.add(question);
        }

        // Generate true/false questions
        for (int i = 0; i < tfCount; i++) {
            String[] template = trueFalseTemplates[i % trueFalseTemplates.length];
            QuestionRequest question = new QuestionRequest();
            question.setContent(String.format(template[0], topic));
            question.setType(Question.QuestionType.TRUE_FALSE);

            List<String> options = new ArrayList<>();
            options.add("True");
            options.add("False");
            question.setOptions(options);

            question.setCorrectAnswer(template[1]);
            question.setExplanation(template[2]);
            question.setPoints("easy".equals(difficulty) ? 1 : "medium".equals(difficulty) ? 2 : 3);

            questions.add(question);
        }

        // Generate essay questions
        for (int i = 0; i < essayCount; i++) {
            String template = essayTemplates[i % essayTemplates.length];
            QuestionRequest question = new QuestionRequest();
            question.setContent(String.format(template, topic));
            question.setType(Question.QuestionType.ESSAY);
            question.setPoints("easy".equals(difficulty) ? 2 : "medium".equals(difficulty) ? 3 : 5);

            questions.add(question);
        }
    }
}