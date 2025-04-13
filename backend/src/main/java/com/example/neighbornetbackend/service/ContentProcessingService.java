package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.dto.ContentImportRequest;
import com.example.neighbornetbackend.dto.QuestionRequest;
import com.example.neighbornetbackend.dto.QuizRequest;
import com.example.neighbornetbackend.model.Question;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ContentProcessingService {
    private static final Logger logger = LoggerFactory.getLogger(ContentProcessingService.class);
    private final RestTemplate restTemplate;

    public ContentProcessingService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public QuizRequest generateQuizFromContent(ContentImportRequest request) {
        String extractedContent = extractContent(request);

        List<String> keyTerms = extractKeyTerms(extractedContent);

        QuizRequest quiz = new QuizRequest();
        quiz.setTitle("Quiz on Imported Content");
        quiz.setDescription("A quiz generated from imported " +
                (request.getContentType().equals("url") ? "web page" : "text") + " content");

        List<QuestionRequest> questions = generateQuestionsFromContent(
                extractedContent,
                keyTerms,
                request.getNumberOfQuestions(),
                request.getDifficulty(),
                request.getQuizType()
        );

        quiz.setQuestions(questions);
        return quiz;
    }

    private String extractContent(ContentImportRequest request) {
        String content = request.getContent();

        if ("url".equals(request.getContentType())) {
            try {
                String webContent = restTemplate.getForObject(content, String.class);

                return extractTextFromHtml(webContent);
            } catch (Exception e) {
                logger.error("Error fetching content from URL: {}", content, e);
                return "Failed to extract content from URL: " + e.getMessage();
            }
        }

        return content;
    }

    private String extractTextFromHtml(String html) {
        if (html == null) {
            return "";
        }

        String noHtml = html.replaceAll("<[^>]*>", " ");

        return noHtml.replaceAll("\\s+", " ").trim();
    }

    private List<String> extractKeyTerms(String content) {
        Set<String> terms = new HashSet<>();

        Pattern capitalizedPattern = Pattern.compile("\\b[A-Z][a-z]{3,}(\\s+[A-Z][a-z]{3,}){0,2}\\b");
        Matcher capitalizedMatcher = capitalizedPattern.matcher(content);

        while (capitalizedMatcher.find() && terms.size() < 30) {
            terms.add(capitalizedMatcher.group());
        }

        Pattern definitionPattern = Pattern.compile(
                "(known as|called|termed|defined as|such as)\\s+([A-Za-z][A-Za-z\\s-]{3,}?)(\\.|,|\\s|$)"
        );
        Matcher definitionMatcher = definitionPattern.matcher(content);

        while (definitionMatcher.find() && terms.size() < 30) {
            terms.add(definitionMatcher.group(2).trim());
        }

        Pattern sentencePattern = Pattern.compile(
                "([A-Z][^.!?]*?(is a|are the|refers to|consists of|means)[^.!?]*?)\\.?"
        );
        Matcher sentenceMatcher = sentencePattern.matcher(content);

        List<String> definitionSentences = new ArrayList<>();
        while (sentenceMatcher.find() && definitionSentences.size() < 15) {
            definitionSentences.add(sentenceMatcher.group(1).trim());
        }

        List<String> keyTerms = new ArrayList<>(terms);
        if (keyTerms.size() > 20) {
            keyTerms = keyTerms.subList(0, 20);
        }

        keyTerms.addAll(definitionSentences);

        return keyTerms;
    }

    private List<QuestionRequest> generateQuestionsFromContent(
            String content, List<String> keyTerms, int numberOfQuestions,
            String difficulty, String quizType) {

        List<QuestionRequest> questions = new ArrayList<>();

        int mcCount = 0, tfCount = 0, essayCount = 0;

        if ("multiple-choice".equals(quizType)) {
            mcCount = numberOfQuestions;
        } else if ("true-false".equals(quizType)) {
            tfCount = numberOfQuestions;
        } else if ("essay".equals(quizType)) {
            essayCount = numberOfQuestions;
        } else {
            mcCount = numberOfQuestions / 2;
            tfCount = numberOfQuestions / 4;
            essayCount = numberOfQuestions - mcCount - tfCount;
        }

        for (int i = 0; i < mcCount && i < keyTerms.size(); i++) {
            QuestionRequest question = createMultipleChoiceQuestion(content, keyTerms, i, difficulty);
            questions.add(question);
        }

        int offset = mcCount;
        for (int i = 0; i < tfCount && offset + i < keyTerms.size(); i++) {
            QuestionRequest question = createTrueFalseQuestion(content, keyTerms, offset + i, difficulty);
            questions.add(question);
        }

        offset = mcCount + tfCount;
        for (int i = 0; i < essayCount; i++) {
            QuestionRequest question = createEssayQuestion(content, keyTerms, offset + i, difficulty);
            questions.add(question);
        }

        while (questions.size() < numberOfQuestions) {
            QuestionRequest question = createGenericQuestion(questions.size(), difficulty,
                    quizType.equals("multiple-choice") ? Question.QuestionType.MULTIPLE_CHOICE :
                            quizType.equals("true-false") ? Question.QuestionType.TRUE_FALSE :
                                    Question.QuestionType.ESSAY);
            questions.add(question);
        }

        return questions;
    }

    private QuestionRequest createMultipleChoiceQuestion(String content, List<String> keyTerms, int index, String difficulty) {
        QuestionRequest question = new QuestionRequest();
        String keyTerm = keyTerms.get(index % keyTerms.size());

        String termSentence = findSentenceContaining(content, keyTerm);

        if (termSentence.isEmpty()) {
            question.setContent("What is meant by the term \"" + keyTerm + "\" in this context?");
        } else {
            question.setContent("Based on the content, what best describes \"" + keyTerm + "\"?");
        }

        question.setType(Question.QuestionType.MULTIPLE_CHOICE);

        List<String> options = new ArrayList<>();

        String correctOption = !termSentence.isEmpty() ?
                generateAnswerFromSentence(termSentence, keyTerm) :
                "The main concept described in the content";
        options.add(correctOption);

        options.add("A concept unrelated to the main topic");
        options.add("A minor detail mentioned only briefly");
        options.add("A term from a different field altogether");

        Collections.shuffle(options);

        question.setOptions(options);
        question.setCorrectAnswer(correctOption);
        question.setExplanation("The text discusses " + keyTerm + " in detail, indicating its importance to the subject matter.");
        question.setPoints("easy".equals(difficulty) ? 1 : "medium".equals(difficulty) ? 2 : 3);

        return question;
    }

    private QuestionRequest createTrueFalseQuestion(String content, List<String> keyTerms, int index, String difficulty) {
        QuestionRequest question = new QuestionRequest();
        String keyTerm = keyTerms.get(index % keyTerms.size());

        String termSentence = findSentenceContaining(content, keyTerm);

        boolean isTrue = new Random().nextBoolean();

        if (!termSentence.isEmpty()) {
            if (isTrue) {
                question.setContent("True or False: " + termSentence);
                question.setCorrectAnswer("True");
                question.setExplanation("This statement is accurate according to the content provided.");
            } else {
                String negatedSentence = negateStatement(termSentence);
                question.setContent("True or False: " + negatedSentence);
                question.setCorrectAnswer("False");
                question.setExplanation("This statement contradicts information in the content provided.");
            }
        } else {
            if (isTrue) {
                question.setContent("True or False: The content discusses " + keyTerm + ".");
                question.setCorrectAnswer("True");
                question.setExplanation("The term " + keyTerm + " is mentioned in the content.");
            } else {
                question.setContent("True or False: The content defines " + keyTerm + " as completely unrelated to the topic.");
                question.setCorrectAnswer("False");
                question.setExplanation("The content does not define " + keyTerm + " as unrelated; it's relevant to the topic.");
            }
        }

        question.setType(Question.QuestionType.TRUE_FALSE);

        List<String> options = new ArrayList<>();
        options.add("True");
        options.add("False");
        question.setOptions(options);

        question.setPoints("easy".equals(difficulty) ? 1 : "medium".equals(difficulty) ? 2 : 3);

        return question;
    }

    private QuestionRequest createEssayQuestion(String content, List<String> keyTerms, int index, String difficulty) {
        QuestionRequest question = new QuestionRequest();

        if (index < keyTerms.size()) {
            String term = keyTerms.get(index);

            if (term.length() > 30) {
                question.setContent("Explain the following concept in your own words: \"" +
                        term.substring(0, Math.min(100, term.length())) +
                        (term.length() > 100 ? "..." : "") + "\"");
            } else {
                question.setContent("Explain the concept of \"" + term + "\" as presented in the content. " +
                        "What is its significance and how does it relate to the broader topic?");
            }
        } else {
            String[] essayPrompts = {
                    "Summarize the main ideas presented in the content.",
                    "Compare and contrast the key concepts discussed in the content.",
                    "What are the implications of the ideas presented in this content?",
                    "How would you apply the concepts from this content in a real-world scenario?",
                    "Critically analyze the arguments presented in the content."
            };

            int promptIndex = index % essayPrompts.length;
            question.setContent(essayPrompts[promptIndex]);
        }

        question.setType(Question.QuestionType.ESSAY);
        question.setPoints("easy".equals(difficulty) ? 2 : "medium".equals(difficulty) ? 3 : 5);

        return question;
    }

    private QuestionRequest createGenericQuestion(int index, String difficulty, Question.QuestionType type) {
        QuestionRequest question = new QuestionRequest();

        if (type == Question.QuestionType.MULTIPLE_CHOICE) {
            String[] genericMC = {
                    "What is the main topic of the content?",
                    "Which of the following best summarizes the content?",
                    "Which concept is most central to the content?",
                    "What can be inferred from the content?",
                    "What is the purpose of the content?"
            };

            question.setContent(genericMC[index % genericMC.length]);

            List<String> options = new ArrayList<>();
            options.add("The specific information presented in the content");
            options.add("A concept unrelated to the content");
            options.add("A misinterpretation of the content");
            options.add("Something not mentioned in the content");

            question.setOptions(options);
            question.setCorrectAnswer("The specific information presented in the content");
            question.setExplanation("This answer accurately reflects what was discussed in the material.");

        } else if (type == Question.QuestionType.TRUE_FALSE) {
            String[] genericTF = {
                    "The content presents factual information about the topic.",
                    "The content covers multiple aspects of the topic.",
                    "The content provides a comprehensive overview of the topic.",
                    "The content focuses on a single aspect of the topic.",
                    "The content presents opposing viewpoints on the topic."
            };

            question.setContent("True or False: " + genericTF[index % genericTF.length]);

            List<String> options = new ArrayList<>();
            options.add("True");
            options.add("False");
            question.setOptions(options);

            question.setCorrectAnswer("True");
            question.setExplanation("This statement accurately describes the nature of the content.");

        } else {
            String[] genericEssay = {
                    "Summarize the key points from the content in your own words.",
                    "Explain how the concepts in the content relate to each other.",
                    "Discuss the significance of the content in a broader context.",
                    "What are your thoughts on the ideas presented in the content?",
                    "How might the information in this content be applied?"
            };

            question.setContent(genericEssay[index % genericEssay.length]);
        }

        question.setType(type);

        if (type == Question.QuestionType.ESSAY) {
            question.setPoints("easy".equals(difficulty) ? 2 : "medium".equals(difficulty) ? 3 : 5);
        } else {
            question.setPoints("easy".equals(difficulty) ? 1 : "medium".equals(difficulty) ? 2 : 3);
        }

        return question;
    }

    private String findSentenceContaining(String content, String term) {
        if (content == null || term == null) return "";

        Pattern sentencePattern = Pattern.compile(
                "([^.!?]*?" + Pattern.quote(term) + "[^.!?]*?[.!?])"
        );

        Matcher matcher = sentencePattern.matcher(content);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }

        return "";
    }

    private String generateAnswerFromSentence(String sentence, String term) {
        String description;

        if (sentence.contains(" is ")) {
            description = sentence.substring(sentence.indexOf(" is ") + 4);
        } else if (sentence.contains(" are ")) {
            description = sentence.substring(sentence.indexOf(" are ") + 5);
        } else {
            description = sentence;
        }

        if (description.length() > 80) {
            description = description.substring(0, 77) + "...";
        }

        return description;
    }

    private String negateStatement(String statement) {
        if (statement.contains(" is ")) {
            return statement.replace(" is ", " is not ");
        } else if (statement.contains(" are ")) {
            return statement.replace(" are ", " are not ");
        } else if (statement.contains(" can ")) {
            return statement.replace(" can ", " cannot ");
        } else if (statement.contains(" has ")) {
            return statement.replace(" has ", " does not have ");
        } else if (statement.contains(" have ")) {
            return statement.replace(" have ", " do not have ");
        } else if (statement.contains(" will ")) {
            return statement.replace(" will ", " will not ");
        } else {
            // Add "not" after first verb (simple approach)
            return "The opposite of what is stated: " + statement;
        }
    }
}