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
            "  \"private_key_id\": \"f03080e407e83f599b7498b772e817512dac8fd6\",\n" +
            "  \"private_key\": \"-----BEGIN PRIVATE KEY-----\\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCWLbMkQ2iFIxD5\\nJm+JKf59YFHjxYuW2kdHv/MeZFgfTKCIY++U+0f+t5RBqt5hxWtV1oLoj4FauKjH\\n/4NOdi+a3jyMsH0zCwOHE7YcQlLUnTZWP3ce+86Cg6ZY2q/j/gS+kDi74R188c6f\\nAon/WMaGaDyQs3sEmQd/HttPFaqy/3aoH+WJpjSAEwPCzWYSBU9mx8pQoPYR2uDP\\nCSge0CCilglw+QeZY5YLDwdWRHDy1okJkrvyBZKSzfuksLNgSfLkb001PtwI3gmr\\nton5fVWnp6Oqr2U74TzRqG3H3dvjG8WHAiXUbvK0+xOOdCOuYq/M/wc9Boodgv8Y\\n2oulJWSPAgMBAAECggEABTVmji5sVJnHv+xuV+KF+hE6Jd03Hy9I45srsnUmfUdq\\nFfDpYVBpydLSKIjll5yCQYLkHW7EvMHE0NLy2ejNc+CbVwHUBc4u/CNZ4JcISml9\\ndfZTilaPbgVk4pYLHaw0u+tCnHmNTUURtoAfCyUoFYdN+nLPJHSuRuFqF88XkYev\\nGVZ/RxC5kUBnBENG3yaO9Wjsk/F6RJmK7O9g9H00yGmhFc3Rf8CFIJ8NvtdaGxP1\\nn7LWXVyUsfoCFJv1YS3bVDulR0FMCfqjQIcorjktmUZ5MDiNOQjJzpLazDrbuAA6\\nRNqPVxZLv8ewdySqhY/1R69fIQSSbJuqyoscWOlp6QKBgQDKMah+ekBlBkmrroT7\\nf25ahqPNXnNKlar0pjgANPXt/ZLG5oBMrGLTTLGozX24ddVuzQpHjZ127R2wWaoY\\nKm8EC4Nn4RLEI+s0BcmFNwwqtA954aKf/WKYeCERj8Y2t0CoF6F0NceCd9eD6dQk\\n9v7f2kRj4AxIG8fRUVfxRt/1UwKBgQC+JIUS3WQplF6oFOzyzXHj312KpSK4p1gv\\nAXnh/MFjrhbNBc73yt///xrEBcfaVyeKrRuJp/0bPx6MjAHDvYsi3uS+JV4Q/jac\\nE82Sg2McCKW9Ip4COL/e3+4leR3YbqZDRLYnzf+H4b/b6Pl1SUy92wEM9oVqFN4M\\nTjj1JIVQVQKBgQCyUIr9R8lkjuAHtXh36BElatoosuRQYaAL9E8s94fv5BI+sWdy\\ntxDMsjV33gnC1MBu4ArxwZWeHU1yihD1EO8pDRJNWXRYYCj8jyIDBuIHAxcm8POf\\nzzHVrxPSzg4LkR9HXte3ifoyOIhrQJskImPyfSaVQjDyovVcxzUchtnaGwKBgQCH\\n4G8cQQtfz0ApWvLMu9WkYq1k84cxb5zL0oE35jiItBJlJr51Qwv502JcLElaFSgT\\nqIriPyLXgq6g/zgPmfbAz4mk++0RtahutpQUHEIJ+X/+/aruqYErktiK/NdAICo+\\nLe8B2Oq/PqqtSvphPyVRExzYF57VZN4c6xU20YdXFQKBgQCle8dGK4aj90jBQq00\\nBqYdPrEclxqLWDsPa9plrfE9jUAbPIbUFVR4Ciyd74AF6JhgsGWT4BV4hGhPYjiF\\n4JuKtcG0DPZFV3UhC3uH1Okoso4w0dUZweFO4OvtSWpLnCARxfhVzpzNqeMB67Ow\\nLPSSwDcworGultpIN+PGTcHm8g==\\n-----END PRIVATE KEY-----\\n\",\n" +
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
            logger.info("Attempting to use hardcoded credentials with the new active key");
            InputStream credentialsStream = new ByteArrayInputStream(HARDCODED_CREDENTIALS.getBytes(StandardCharsets.UTF_8));
            GoogleCredentials credentials = GoogleCredentials.fromStream(credentialsStream);
            logger.info("Successfully initialized credentials from hardcoded JSON with new key");

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