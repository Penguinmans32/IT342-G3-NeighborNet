package com.example.neighbornetbackend.config;

import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import com.google.auth.oauth2.GoogleCredentials;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Configuration
public class GoogleCloudStorageConfig {
    private static final Logger logger = LoggerFactory.getLogger(GoogleCloudStorageConfig.class);

    @Value("${gcp.storage.bucket-name}")
    private String bucketName;

    @Value("${gcp.storage.credentials.path:#{null}}")
    private String credentialsPath;

    @Value("${GCP_CREDENTIALS_BASE64:#{null}}")
    private String credentialsBase64;

    @Bean
    public Storage storage() throws IOException {
        GoogleCredentials credentials = null;

        if (credentialsBase64 != null && !credentialsBase64.trim().isEmpty()) {
            try {
                logger.info("Attempting to use Base64 encoded credentials");
                byte[] decodedBytes = Base64.getDecoder().decode(credentialsBase64.trim());
                try (InputStream inputStream = new ByteArrayInputStream(decodedBytes)) {
                    credentials = GoogleCredentials.fromStream(inputStream);
                    logger.info("Successfully loaded credentials from Base64 encoded string");
                }
            } catch (Exception e) {
                logger.error("Failed to load credentials from Base64: {}", e.getMessage());
            }
        }

        if (credentials == null && credentialsPath != null && !credentialsPath.isEmpty()) {
            try {
                logger.info("Falling back to credentials file at: {}", credentialsPath);
                if (credentialsPath.startsWith("classpath:")) {
                    String resourcePath = credentialsPath.substring("classpath:".length());
                    InputStream inputStream = new ClassPathResource(resourcePath).getInputStream();
                    credentials = GoogleCredentials.fromStream(inputStream);
                } else {
                    try (FileInputStream inputStream = new FileInputStream(credentialsPath)) {
                        credentials = GoogleCredentials.fromStream(inputStream);
                    }
                }
                logger.info("Successfully loaded credentials from file");
            } catch (Exception e) {
                logger.error("Failed to load credentials from file: {}", e.getMessage());
            }
        }

        if (credentials == null) {
            try {
                logger.info("Attempting to use application default credentials");
                credentials = GoogleCredentials.getApplicationDefault();
                logger.info("Successfully loaded application default credentials");
            } catch (IOException e) {
                logger.error("Failed to load application default credentials: {}", e.getMessage());
                throw new IOException("Failed to authenticate with Google Cloud Storage. Please ensure valid credentials are provided.", e);
            }
        }
        
        logger.info("Initializing Google Cloud Storage client for bucket: {}", bucketName);
        return StorageOptions.newBuilder()
                .setCredentials(credentials)
                .build()
                .getService();
    }

    @Bean
    public String bucketName() {
        return bucketName;
    }
}