package com.example.neighbornetbackend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.SubscribableChannel;
import org.springframework.messaging.converter.DefaultContentTypeResolver;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.converter.MessageConverter;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.concurrent.ConcurrentTaskScheduler;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;
import org.springframework.web.socket.messaging.StompSubProtocolHandler;
import org.springframework.web.socket.messaging.SubProtocolWebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final ObjectMapper objectMapper;

    public WebSocketConfig(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue", "/user")
                .setHeartbeatValue(new long[]{10000L, 10000L})
                .setTaskScheduler(new ConcurrentTaskScheduler());
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins(
                        "https://it-342-g3-neighbor-net.vercel.app",
                        "http://localhost:5173",
                        "http://10.0.2.2:8080",
                        "http://10.0.191.212:8080"
                )
                .setHandshakeHandler(new DefaultHandshakeHandler() {
                    @Override
                    protected Principal determineUser(ServerHttpRequest request, WebSocketHandler wsHandler, Map<String, Object> attributes) {
                        return request.getPrincipal();
                    }
                });

        registry.addEndpoint("/ws")
                .setAllowedOrigins(
                        "https://it-342-g3-neighbor-net.vercel.app",
                        "http://localhost:5173",
                        "http://10.0.2.2:8080",
                        "http://10.0.191.212:8080"
                )
                .withSockJS()
                .setWebSocketEnabled(true)
                .setHeartbeatTime(25000)
                .setDisconnectDelay(5000);
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration
                .setMessageSizeLimit(128 * 1024)
                .setSendBufferSizeLimit(512 * 1024)
                .setSendTimeLimit(20000);
    }

    @Override
    public boolean configureMessageConverters(List<MessageConverter> messageConverters) {
        MappingJackson2MessageConverter converter = new MappingJackson2MessageConverter();
        converter.setObjectMapper(objectMapper);
        messageConverters.add(converter);
        return false;
    }
}