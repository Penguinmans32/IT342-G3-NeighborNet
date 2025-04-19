package com.example.neighbornetbackend.config;

import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import com.google.auth.oauth2.GoogleCredentials;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.nio.charset.StandardCharsets;

@Configuration
public class GoogleCloudStorageConfig {
    private static final Logger logger = LoggerFactory.getLogger(GoogleCloudStorageConfig.class);

    @Value("${gcp.storage.bucket-name}")
    private String bucketName;

    private static final String HARDCODED_CREDENTIALS = "{\n" +
            "  \"type\": \"service_account\",\n" +
            "  \"project_id\": \"gen-lang-client-0367608845\",\n" +
            "  \"private_key_id\": \"81925c3bbe2b859b52fe6b9d8b865af8acd8832f\",\n" +
            "  \"private_key\": \"-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC4MIiIrinPOs12\\n47oBX/WKOlpq64oG9o7qhogW+vgrksz2D0cwhb/cBxY7OglqfwC1QRhc4aEdD3Ch\\nIHxtgeOGvORrxRVYF+MIqRxXdTtTwNpVr++4ACHIbvwRoJ+kMfaJ44CnIW9FxDkq\\n+zqU+2LXEDYuxHlMXP/Z1xYprWEh4jCr7kbXL9cy+wHFL4Mll3oU+QUS+XZsNyfU\\nAIZUBxSvfCKnxsE44Q2pLpIRadCX4XRdVjgI3cZ4Lc2sAL/S+F01bP0+yT/9tdu0\\niodMxdT8TgS8IxJiQ07b4HuG/t6uHvt4lYvXErXnI8ZLNQn+EarTPrGkZQPrwYgs\\nvMdz/aVVAgMBAAECggEASBFBUs1mcX1uCB8pV8FeluOnHh+j5X6SQ8Q4ulkfQhlR\\n1dL7hUpH3ATv12OpbIBd3A2oxSrJOdAhPwIxfT1ts3n0HBDEfa/29pwIiVXGzUnv\\ng8hvkLyIe16lhRYmcH3WG3SnEX29Bny065LaBJHpxgFDWgAo/86BkxAbzVnX4APv\\nSBWyMrfl7YJBzz30lUZg1vx0DYhRNgFiUPIRWFm6BMB4LcQ4PrWOHtIW5EJVCToc\\np2YAIAd41uSPHqpBTB9KuQSXwu27uuEibMBATka7aHb6D3UZuE/v03YZiXCBoCX8\\nFoAxPQNaDJYjUA8UXyh4vKo4UCaM235cdFf+CqmY3wKBgQD7iDyx6AyVcuj03mhz\\nuYpLC9J3MDf+OQmt0mkbwtSAm4WYTyvoRf/rU4pFh5/lU4cggO9zuK5zq7UNuVR+\\nh91H8RL0gNmIKokPIuxwLx5/1lGP5k9pgWxyo/T9BIZT7vFsgz8JEkKyIrVCYV79\\nzC4fzhAO4RVcirAQL/zgo7VeswKBgQC7dhO++F8WB17LeFkniiwAXVU580O+7eRH\\npsnTHpJ4dYQmqMSO31gHR9uKRvo4iwn8teTRPdB7cU3V/n1QOEayfOZQP33KZd9w\\ngf8omLbGbu+q2KP42fRD2PA2HAVAsruGf174KW9CfSIZIPSoUsQNJyBR3RCUFfSs\\nCfF4cLbv1wKBgQD5FGYWPpYHgG0T3xJMVtWNjz1xbbxk8RKWoKAZL4vDdz6KHwx5\\nzKeq32UziSRbsaVEGKoGTEHkpYp69qWnTt9fmGiO2vGPF5/17z13shFfwlmuSAEn\\nl1RPCfFWhJ6Iiztjm2xWjVCimiAohcfNR938/M+GDHpc07GZtguSYEsAZQKBgF+b\\nCNcMtPH3MFF1P4L65RYKg7zaZGKr0RD571TM8sacqJlO2XBEWBDehQkwycysnJtV\\n6S0N6ZYLYzcQY7jV+rhtGskymGTxL9OheRCrUgxB59mqQ3ZXMkyoB1qRT9x/S0R9\\nEWJfP28ZgppuRFjUXUiX+9PEewALco2LRKu4UJRhAoGBAKvMK9ssXIMVtXmbdlNo\\nHNqVEtnOk+nB5c3tPt5zOCWtahU5eZvOVfMeF6YPOs4kwNQZzFIhPGRGIDLwwHGT\\njO46L4PEA5crUxIBHdTyJQ7kVaq8eNx7QadzSXNKkHVHvQ8w595Op9LnpNSQUa2O\\nuIo5dxdotV6ePvUkStb4fSKK\\n-----END PRIVATE KEY-----\\n\",\n" +
            "  \"client_email\": \"neighbornet-storage-service@gen-lang-client-0367608845.iam.gserviceaccount.com\",\n" +
            "  \"client_id\": \"105386220162196347279\",\n" +
            "  \"auth_uri\": \"https://accounts.google.com/o/oauth2/auth\",\n" +
            "  \"token_uri\": \"https://oauth2.googleapis.com/token\",\n" +
            "  \"auth_provider_x509_cert_url\": \"https://www.googleapis.com/oauth2/v1/certs\",\n" +
            "  \"client_x509_cert_url\": \"https://www.googleapis.com/robot/v1/metadata/x509/neighbornet-storage-service%40gen-lang-client-0367608845.iam.gserviceaccount.com\",\n" +
            "  \"universe_domain\": \"googleapis.com\"\n" +
            "}";

    @Bean
    public Storage storage() throws IOException {
        try {
            logger.info("Attempting to use hardcoded credentials");
            InputStream credentialsStream = new ByteArrayInputStream(HARDCODED_CREDENTIALS.getBytes(StandardCharsets.UTF_8));
            GoogleCredentials credentials = GoogleCredentials.fromStream(credentialsStream);
            logger.info("Successfully initialized credentials from hardcoded JSON");

            return StorageOptions.newBuilder()
                    .setCredentials(credentials)
                    .build()
                    .getService();
        } catch (IOException e) {
            logger.error("Error initializing storage with hardcoded credentials: {}", e.getMessage(), e);
            throw new IOException("Failed to initialize Google Cloud Storage", e);
        }
    }

    @Bean
    public String bucketName() {
        return bucketName;
    }
}