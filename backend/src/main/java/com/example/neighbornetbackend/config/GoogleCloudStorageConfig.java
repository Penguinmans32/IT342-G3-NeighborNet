package com.example.neighbornetbackend.config;

import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import com.google.auth.oauth2.GoogleCredentials;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;

@Configuration
public class GoogleCloudStorageConfig {

    @Value("${gcp.storage.bucket-name}")
    private String bucketName;

    @Value("${gcp.storage.credentials.path:classpath:gcp-credentials.json}")
    private String credentialsPath;

    @Bean
    public Storage storage() throws IOException {
        InputStream inputStream;
        if (credentialsPath.startsWith("classpath:")) {
            inputStream = new ClassPathResource(credentialsPath.substring("classpath:".length())).getInputStream();
        } else {
            inputStream = new java.io.FileInputStream(credentialsPath);
        }

        GoogleCredentials credentials = GoogleCredentials.fromStream(inputStream);

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