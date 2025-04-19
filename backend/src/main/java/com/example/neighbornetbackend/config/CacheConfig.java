package com.example.neighbornetbackend.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.util.Arrays;

@Configuration
@EnableCaching
public class CacheConfig {
    @Bean
    @Primary
    public CacheManager cacheManager() {
        SimpleCacheManager cacheManager = new SimpleCacheManager();
        cacheManager.setCaches(Arrays.asList(
                new ConcurrentMapCache("classes"),
                new ConcurrentMapCache("popularClasses"),
                new ConcurrentMapCache("userClasses"),
                new ConcurrentMapCache("classFeedbacks"),
                new ConcurrentMapCache("classRatings"),
                new ConcurrentMapCache("relatedClasses"),
                new ConcurrentMapCache("userStats"),
                new ConcurrentMapCache("recentActivities")
        ));
        return cacheManager;
    }
}