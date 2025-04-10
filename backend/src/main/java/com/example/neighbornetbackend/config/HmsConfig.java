package com.example.neighbornetbackend.config;

import com.example.neighbornetbackend.service.RoomService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class HmsConfig implements InitializingBean {
    @Value("${hms.access.key}")
    private String accessKey;

    @Value("${hms.access.secret}")
    private String appSecret;

    @Value("${hms.template.id}")
    private String templateId;

    private static final Logger logger = LoggerFactory.getLogger(HmsConfig.class);

    @Override
    public void afterPropertiesSet() {
        logger.debug("HMS Configuration:");
        logger.debug("Access Key length: {}", accessKey.length());
        logger.debug("App Secret length: {}", appSecret.length());
        logger.debug("Template ID length: {}", templateId.length());

        if (accessKey == null || accessKey.trim().isEmpty()) {
            throw new IllegalStateException("HMS access key is not configured");
        }
        if (appSecret == null || appSecret.trim().isEmpty()) {
            throw new IllegalStateException("HMS app secret is not configured");
        }
        if (templateId == null || templateId.trim().isEmpty()) {
            throw new IllegalStateException("HMS template ID is not configured");
        }
    }
}