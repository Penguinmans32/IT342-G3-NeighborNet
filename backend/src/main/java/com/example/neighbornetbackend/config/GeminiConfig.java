package com.example.neighbornetbackend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class GeminiConfig {

    private static final Logger logger = LoggerFactory.getLogger(GeminiConfig.class);

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent}")
    private String apiUrl;

    @Bean
    public RestTemplate geminiRestTemplate() {
        return new RestTemplate();
    }

    public String getApiKey() {
        if (apiKey == null || apiKey.isBlank()) {
            logger.warn("Gemini API key is not set. Local fallback quiz generation will be used.");
            return "";
        }
        return apiKey;
    }

    public String getApiUrl() {
        return apiUrl;
    }
}