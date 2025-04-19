package com.example.neighbornetbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

@SpringBootApplication
@EnableScheduling
@EnableWebSecurity
public class NeighborNetBackendApplication {

    public static void main(String[] args) {
        SpringApplication application = new SpringApplication(NeighborNetBackendApplication.class);

        String environment = System.getenv("SPRING_PROFILES_ACTIVE");
        if (environment == null) {
            application.setAdditionalProfiles("prod");
        }

        application.run(args);
    }
}
