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

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;

@Configuration
public class GoogleCloudStorageConfig {
    private static final Logger logger = LoggerFactory.getLogger(GoogleCloudStorageConfig.class);

    @Value("${gcp.storage.bucket-name}")
    private String bucketName;

    @Value("${gcp.storage.credentials.path:classpath:gcp-credentials.json}")
    private String credentialsPath;

    @Bean
    public Storage storage() throws IOException {
        GoogleCredentials credentials = null;

        if (credentialsPath != null && !credentialsPath.isEmpty()) {
            try {
                if (credentialsPath.startsWith("classpath:")) {
                    String resourcePath = credentialsPath.substring("classpath:".length());
                    logger.info("Looking for credentials in classpath: {}", resourcePath);

                    try {
                        InputStream inputStream = new ClassPathResource(resourcePath).getInputStream();
                        credentials = GoogleCredentials.fromStream(inputStream);
                        logger.info("Successfully loaded credentials from classpath resource");
                    } catch (IOException e) {
                        logger.warn("Failed to load credentials from classpath: {}", e.getMessage());
                    }
                } else {
                    File credentialsFile = new File(credentialsPath);
                    logger.info("Looking for credentials at path: {}", credentialsPath);

                    if (credentialsFile.exists() && credentialsFile.canRead()) {
                        try (FileInputStream inputStream = new FileInputStream(credentialsFile)) {
                            credentials = GoogleCredentials.fromStream(inputStream);
                            logger.info("Successfully loaded credentials from file");
                        } catch (IOException e) {
                            logger.warn("Failed to load credentials from file: {}", e.getMessage());
                        }
                    } else {
                        logger.warn("Credentials file does not exist or cannot be read at path: {}", credentialsPath);
                    }
                }
            } catch (Exception e) {
                logger.warn("Error loading credentials from specified path: {}", e.getMessage());
            }
        }

        if (credentials == null) {
            try {
                logger.info("Attempting to use application default credentials");
                credentials = GoogleCredentials.getApplicationDefault();
                logger.info("Successfully loaded application default credentials");
            } catch (IOException e) {
                logger.error("Failed to load application default credentials: {}", e.getMessage());

                throw new IOException("Failed to authenticate with Google Cloud Storage. " +
                        "Please ensure that either valid credentials are provided at " + credentialsPath +
                        " or application default credentials are available.", e);
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