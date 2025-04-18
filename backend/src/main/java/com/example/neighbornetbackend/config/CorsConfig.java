package com.example.neighbornetbackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        config.addAllowedOrigin("https://it-342-g3-neighbor-net.vercel.app");
        config.addAllowedOrigin("http://localhost:5173");
        config.addAllowedOrigin("http://10.0.2.2:8080");
        config.addAllowedOrigin("http://10.0.191.212:8080");

        config.setAllowCredentials(true);

        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        config.addExposedHeader("Authorization");
        config.addExposedHeader("X-CSRF-TOKEN");
        config.addExposedHeader("CSRF-TOKEN");

        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}