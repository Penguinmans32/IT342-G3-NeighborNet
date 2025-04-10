package com.example.neighbornetbackend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;

@Service
@Slf4j
public class HmsWebClientService {
    private final WebClient webClient;
    private final String appAccessKey;
    private final String appSecret;
    private final String templateId;
    private final ObjectMapper objectMapper;

    private static final Logger logger = LoggerFactory.getLogger(HmsWebClientService.class);

    public HmsWebClientService(
            @Value("${hms.access.key}") String appAccessKey,
            @Value("${hms.access.secret}") String appSecret,
            @Value("${hms.template.id}") String templateId
    ) {
        this.appAccessKey = appAccessKey;
        this.appSecret = appSecret;
        this.templateId = templateId;
        this.objectMapper = new ObjectMapper();

        this.webClient = WebClient.builder()
                .baseUrl("https://api.100ms.live/v2")
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024))
                .build();
    }

    public Mono<Map> createRoom(String roomName, String description) {
        String managementToken = generateManagementToken();
        logger.debug("Access Key: {}", appAccessKey);
        logger.debug("Template ID: {}", templateId);
        logger.debug("Management Token: {}", managementToken);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("name", roomName);
        requestBody.put("description", description);
        requestBody.put("template_id", templateId);
        requestBody.put("region", "in");

        return webClient.post()
                .uri("/rooms")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + managementToken)
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(HttpStatusCode::isError, response ->
                        response.bodyToMono(String.class)
                                .flatMap(error -> {
                                    logger.error("Error response from HMS API: {}", error);
                                    return Mono.error(new RuntimeException("HMS API error: " + error));
                                })
                )
                .bodyToMono(Map.class)
                .doOnSuccess(response -> logger.debug("Successfully created room: {}", response))
                .doOnError(error -> logger.error("Error creating room: {}", error.getMessage()));
    }

    private String generateManagementToken() {
        try {
            long now = Instant.now().minusSeconds(60).getEpochSecond();
            long exp = now + (24 * 60 * 60);

            Map<String, Object> header = new HashMap<>();
            header.put("alg", "HS256");
            header.put("typ", "JWT");

            Map<String, Object> payload = new HashMap<>();
            payload.put("access_key", appAccessKey);
            payload.put("type", "management");
            payload.put("version", 2);
            payload.put("exp", exp);
            payload.put("iat", now);
            payload.put("nbf", now);
            payload.put("jti", UUID.randomUUID().toString());
            payload.put("permissions", Arrays.asList(
                    "publish_audio", "subscribe_audio", "unmute_audio"
            ));

            String headerB64 = Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(objectMapper.writeValueAsString(header).getBytes(StandardCharsets.UTF_8));
            String payloadB64 = Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(objectMapper.writeValueAsString(payload).getBytes(StandardCharsets.UTF_8));

            String dataToSign = headerB64 + "." + payloadB64;
            Mac sha256Hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(
                    appSecret.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256"
            );
            sha256Hmac.init(secretKey);
            String signature = Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(sha256Hmac.doFinal(dataToSign.getBytes(StandardCharsets.UTF_8)));

            String token = dataToSign + "." + signature;
            logger.debug("Generated token with iat: {}, exp: {}", now, exp);
            return token;
        } catch (Exception e) {
            logger.error("Error generating management token: ", e);
            throw new RuntimeException("Failed to generate management token", e);
        }
    }

    private String generateToken(Map<String, Object> header, Map<String, Object> payload) throws Exception {
        String headerB64 = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(objectMapper.writeValueAsString(header).getBytes(StandardCharsets.UTF_8));
        String payloadB64 = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(objectMapper.writeValueAsString(payload).getBytes(StandardCharsets.UTF_8));

        String dataToSign = headerB64 + "." + payloadB64;
        Mac sha256Hmac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(
                appSecret.getBytes(StandardCharsets.UTF_8),
                "HmacSHA256"
        );
        sha256Hmac.init(secretKey);
        String signature = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(sha256Hmac.doFinal(dataToSign.getBytes(StandardCharsets.UTF_8)));

        return dataToSign + "." + signature;
    }

    public String generateAuthToken(String roomId, String userId, String role) {
        try {
            long now = Instant.now().minusSeconds(60).getEpochSecond();
            long exp = now + (24 * 60 * 60);

            String normalizedRole = normalizeRole(role);

            Map<String, Object> header = new HashMap<>();
            header.put("alg", "HS256");
            header.put("typ", "JWT");

            Map<String, Object> payload = new HashMap<>();
            payload.put("access_key", appAccessKey);
            payload.put("room_id", roomId);
            payload.put("user_id", userId);
            payload.put("role", normalizedRole);
            payload.put("type", "app");
            payload.put("version", 2);
            payload.put("exp", exp);
            payload.put("iat", now);
            payload.put("nbf", now);
            payload.put("jti", UUID.randomUUID().toString());

            List<String> permissions = new ArrayList<>();
            if (normalizedRole.equals("moderator")) {
                permissions.addAll(Arrays.asList(
                        "publish_audio",
                        "subscribe_audio",
                        "unmute_audio"
                ));
            } else {
                permissions.add("subscribe_audio");
            }
            payload.put("permissions", permissions);

            String token = generateToken(header, payload);
            logger.debug("Generated auth token for room {} with role {} at {}", roomId, normalizedRole, now);
            return token;
        } catch (Exception e) {
            logger.error("Error generating auth token for room {}: ", roomId, e);
            throw new RuntimeException("Failed to generate auth token", e);
        }
    }

    private String normalizeRole(String role) {
        switch (role.toLowerCase()) {
            case "host":
                return "moderator";
            case "speaker":
                return "speaker";
            default:
                return "listener";
        }
    }

    public Mono<Map> createRoomCode(String roomId, String role) {
        String managementToken = generateManagementToken();

        return webClient.post()
                .uri("/room-codes/room/" + roomId + "/role/" + role)
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + managementToken)
                .retrieve()
                .bodyToMono(Map.class)
                .doOnSuccess(response -> logger.debug("Successfully created room code for role {}: {}", role, response))
                .doOnError(error -> logger.error("Error creating room code: {}", error.getMessage()));
    }
}