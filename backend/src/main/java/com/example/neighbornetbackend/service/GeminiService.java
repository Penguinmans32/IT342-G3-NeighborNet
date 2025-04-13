package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.config.GeminiConfig;
import com.example.neighbornetbackend.dto.QuestionRequest;
import com.example.neighbornetbackend.dto.QuizGenerationRequest;
import com.example.neighbornetbackend.dto.QuizRequest;
import com.example.neighbornetbackend.model.Question;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);

    private final RestTemplate restTemplate;
    private final GeminiConfig geminiConfig;
    private final ObjectMapper objectMapper;
    private final LocalQuizGenerator localQuizGenerator;

    @Autowired
    public GeminiService(RestTemplate restTemplate, GeminiConfig geminiConfig, LocalQuizGenerator localQuizGenerator) {
        this.restTemplate = restTemplate;
        this.geminiConfig = geminiConfig;
        this.objectMapper = new ObjectMapper();
        this.localQuizGenerator = localQuizGenerator;
    }

    public QuizRequest generateQuiz(QuizGenerationRequest request) {
        if (geminiConfig.getApiKey().isEmpty()) {
            logger.info("Gemini API key not configured. Using local quiz generation.");
            return localQuizGenerator.generateLocalQuiz(request);
        }

        try {
            // Try to use Gemini API first
            logger.info("Attempting to generate quiz using Gemini API");
            return generateQuizWithGemini(request);
        } catch (RestClientException e) {
            logger.warn("Gemini API request failed: {}", e.getMessage());
            logger.info("Using fallback local quiz generation");
            return localQuizGenerator.generateLocalQuiz(request);
        } catch (Exception e) {
            logger.error("Unexpected error during quiz generation", e);
            return localQuizGenerator.generateLocalQuiz(request);
        }
    }

    private QuizRequest generateQuizWithGemini(QuizGenerationRequest request) {
        String prompt = buildPrompt(request);
        String apiKey = geminiConfig.getApiKey();
        String url = geminiConfig.getApiUrl() + "?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> content = new HashMap<>();
        List<Map<String, Object>> parts = new ArrayList<>();

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);
        parts.add(textPart);

        content.put("parts", parts);
        requestBody.put("contents", List.of(content));

        // Configure generation parameters
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.7);
        generationConfig.put("maxOutputTokens", 2048);
        generationConfig.put("topP", 0.95);
        generationConfig.put("topK", 40);
        requestBody.put("generationConfig", generationConfig);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        logger.info("Calling Gemini API at URL: {}", url);
        logger.info("Using model: gemini-pro");

        return processGeminiResponse(response.getBody(), request);
    }

    private String buildPrompt(QuizGenerationRequest request) {
        String questionType = request.getQuizType() != null ? request.getQuizType() : "mixed";

        return "Create a " + questionType + " quiz about \"" + request.getTopic() + "\" with " +
                request.getNumberOfQuestions() + " questions at " + request.getDifficulty() + " difficulty level.\n\n" +
                "Each question should include:\n" +
                "1. The question text\n" +
                "2. The question type (MULTIPLE_CHOICE, TRUE_FALSE, or ESSAY)\n" +
                "3. Four options for multiple choice questions (where one is correct)\n" +
                "4. Two options for true/false questions\n" +
                "5. A clear correct answer\n" +
                "6. An explanation of why the answer is correct (2-3 sentences)\n\n" +
                "Format your response as a JSON object with this structure:\n" +
                "{\n" +
                "  \"title\": \"[Quiz Title]\",\n" +
                "  \"description\": \"[Brief quiz description]\",\n" +
                "  \"questions\": [\n" +
                "    {\n" +
                "      \"content\": \"[Question text]\",\n" +
                "      \"type\": \"[MULTIPLE_CHOICE or TRUE_FALSE or ESSAY]\",\n" +
                "      \"points\": 1,\n" +
                "      \"options\": [\"option1\", \"option2\", \"option3\", \"option4\"],\n" +
                "      \"correctAnswer\": \"[correct option text]\",\n" +
                "      \"explanation\": \"[Explanation why this is correct]\"\n" +
                "    },\n" +
                "    ...\n" +
                "  ]\n" +
                "}\n";
    }

    private QuizRequest processGeminiResponse(String responseBody, QuizGenerationRequest request) {
        try {
            JsonNode rootNode = objectMapper.readTree(responseBody);
            String content = rootNode.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();

            // Extract the JSON part from potential markdown code blocks
            if (content.contains("```json")) {
                content = content.substring(content.indexOf("```json") + 7, content.lastIndexOf("```"));
            } else if (content.contains("```")) {
                content = content.substring(content.indexOf("```") + 3, content.lastIndexOf("```"));
            }

            // Parse the actual JSON content
            try {
                JsonNode quizData = objectMapper.readTree(content.trim());

                QuizRequest quiz = new QuizRequest();
                quiz.setTitle(quizData.has("title") ? quizData.get("title").asText() :
                        "Quiz on " + request.getTopic());
                quiz.setDescription(quizData.has("description") ? quizData.get("description").asText() :
                        "A " + request.getDifficulty() + " quiz about " + request.getTopic());

                List<QuestionRequest> questions = new ArrayList<>();
                JsonNode questionsNode = quizData.get("questions");

                for (JsonNode questionNode : questionsNode) {
                    QuestionRequest question = new QuestionRequest();
                    question.setContent(questionNode.get("content").asText());

                    String typeStr = questionNode.get("type").asText();
                    Question.QuestionType type;
                    if (typeStr.equals("MULTIPLE_CHOICE")) {
                        type = Question.QuestionType.MULTIPLE_CHOICE;
                    } else if (typeStr.equals("TRUE_FALSE")) {
                        type = Question.QuestionType.TRUE_FALSE;
                    } else {
                        type = Question.QuestionType.ESSAY;
                    }
                    question.setType(type);

                    if (questionNode.has("points")) {
                        question.setPoints(questionNode.get("points").asInt());
                    } else {
                        question.setPoints(1); // Default to 1 point
                    }

                    if (type != Question.QuestionType.ESSAY && questionNode.has("options")) {
                        List<String> options = new ArrayList<>();
                        for (JsonNode option : questionNode.get("options")) {
                            options.add(option.asText());
                        }
                        question.setOptions(options);
                    }

                    if (questionNode.has("correctAnswer")) {
                        question.setCorrectAnswer(questionNode.get("correctAnswer").asText());
                    }

                    if (questionNode.has("explanation")) {
                        question.setExplanation(questionNode.get("explanation").asText());
                    }

                    questions.add(question);
                }

                quiz.setQuestions(questions);
                return quiz;
            } catch (JsonProcessingException e) {
                logger.error("Failed to parse Gemini JSON response", e);
                throw e;
            }

        } catch (Exception e) {
            logger.error("Failed to process Gemini response", e);
            throw new RuntimeException("Failed to parse Gemini response", e);
        }
    }
}