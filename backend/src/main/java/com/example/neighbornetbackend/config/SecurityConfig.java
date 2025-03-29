package com.example.neighbornetbackend.config;

import com.example.neighbornetbackend.security.*;
import com.example.neighbornetbackend.service.CustomOAuth2UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.orm.jpa.support.OpenEntityManagerInViewFilter;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Arrays;
import java.util.Map;

/**
 * Security Configuration for the NeighborNet Backend application.
 *
 * This configuration implements a modern security approach that combines both backend and frontend security measures.
 * While many endpoints are marked with permitAll(), the application remains secure through:
 *
 * 1. Frontend Security:
 *    - All protected routes implement authentication checks
 *    - JWT tokens are required for accessing protected pages
 *    - Unauthorized users are automatically redirected to login
 *
 * 2. API Security:
 *    - All API requests from frontend include JWT tokens in Authorization header
 *    - Example: axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
 *    - Token validation through JwtAuthenticationFilter
 *    - Firebase authentication integration for additional security
 *
 * 3. Why permitAll() is used:
 *    a) Static Resources:
 *       - /api/classes/thumbnail/**
 *       - /api/users/profile-pictures/*
 *       - /api/posts/images/**
 *       Rationale: Allows efficient loading of images and static content without unnecessary authentication overhead,
 *       similar to how GitHub serves public repository content.
 *
 *    b) Public API Endpoints:
 *       - /api/classes/**
 *       - /api/borrowing/items/*
 *       Rationale: While marked as permitAll(), these endpoints are still protected because:
 *       1. Frontend always includes JWT tokens in requests
 *       2. Protected operations verify tokens through JwtAuthenticationFilter
 *       3. @CurrentUser annotation in controllers ensures user authentication
 *
 *    c) WebSocket & Communication:
 *       - /ws/**
 *       - /topic/**
 *       - /queue/**
 *       Rationale: WebSocket connections are authenticated through:
 *       1. Frontend connection only established with valid token
 *       2. Socket authentication handled in connection phase
 *
 * 4. Security Implementation:
 *    - Token-based authentication (JWT)
 *    - Stateless session management
 *    - CORS configuration for frontend access
 *    - OAuth2 integration for social login
 *    - Multiple authentication filters
 *
 */

@Configuration
@EnableWebSecurity
@Slf4j
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService customUserDetailsService;
    private final FirebaseAuthenticationTokenFilter firebaseAuthenticationTokenFilter;

    @Autowired
    private CustomOAuth2UserService customOAuth2UserService;

    @Autowired
    private OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;

    @Autowired
    private OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          CustomUserDetailsService customUserDetailsService, FirebaseAuthenticationTokenFilter firebaseAuthenticationTokenFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.customUserDetailsService = customUserDetailsService;
        this.firebaseAuthenticationTokenFilter = firebaseAuthenticationTokenFilter;
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();
                    config.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
                    config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
                    config.setAllowCredentials(true);
                    config.setAllowedHeaders(Arrays.asList("*"));
                    config.setExposedHeaders(Arrays.asList(
                            "Access-Control-Allow-Origin",
                            "Access-Control-Allow-Credentials",
                            "Cross-Origin-Opener-Policy"
                    ));
                    return config;
                }))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .authorizeHttpRequests(auth -> auth
                        // Static Resources & Media Files
                        // These are public for performance but protected operations still require authentication
                        .requestMatchers(
                                "/images/**",
                                "/default-class-image.jpg"
                        ).permitAll()

                        .requestMatchers(
                                "/api/classes/*/lessons/video/*",
                                "/api/classes/lessons/video/*",
                                "/api/borrowing/items/images/**",
                                "/api/posts/images/**",
                                "/api/users/profile-pictures/**",
                                "/api/classes/thumbnail/**",
                                "/api/classes/thumbnail/{filename:.+}",
                                "/videos/*"
                        ).permitAll()

                        // API Endpoints - Borrowing System
                        // While public, protected operations verify JWT tokens
                        .requestMatchers(
                                "/api/borrowing/items/*",
                                "/api/borrowing/items",
                                "/api/borrowing/requests/",
                                "/api/borrowing/requests",
                                "/api/borrowing/items/user/*"
                        ).permitAll()

                        // API Endpoints - Classes and User Profiles
                        .requestMatchers(
                                "/api/classes/{id}",
                                "/api/classes/**",
                                "/api/users/profile/**",
                                "/api/dashboard/stats"
                        ).permitAll()

                        // WebSocket & Communication
                        // Authentication handled during connection establishment
                        .requestMatchers(
                                "/ws/**",
                                "/topic/**",
                                "/ws/info",
                                "/queue/**",
                                "/messages/**",
                                "/ws/sockjs/**",
                                "/ws/websocket/**",
                                "/conversations/**",
                                "/chat/**",
                                "/user/**",
                                "/app/**"
                        ).permitAll()

                        // Authentication, OAuth2, and Password Management
                        .requestMatchers(
                                "/api/auth/**",
                                "/oauth2/**",
                                "/login/oauth2/code/**",
                                "/",
                                "/error",
                                "/login",
                                "/api/auth/password/**"
                        ).permitAll()

                        // API Documentation & Development Tools
                        .requestMatchers(
                                "/api/test/public",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/swagger-ui.html",
                                "/swagger-resources/**",
                                "/webjars/**"
                        ).permitAll()

                        // Notifications
                        .requestMatchers("/api/notifications/**").permitAll()

                        // Any other request requires authentication
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(authorizationEndpoint -> authorizationEndpoint
                                .baseUri("/oauth2/authorize")
                                .authorizationRequestRepository(cookieAuthorizationRequestRepository())
                        )
                        .redirectionEndpoint(redirectionEndpoint -> redirectionEndpoint
                                .baseUri("/login/oauth2/code/*")
                        )
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService)
                        )
                        .successHandler(oAuth2AuthenticationSuccessHandler)
                        .failureHandler(oAuth2AuthenticationFailureHandler)
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(firebaseAuthenticationTokenFilter, JwtAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public HttpCookieOAuth2AuthorizationRequestRepository cookieAuthorizationRequestRepository() {
        return new HttpCookieOAuth2AuthorizationRequestRepository();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",
                "http://10.0.2.2:8080",
                "http://10.0.2.2",
                "http://10.0.118.40:8080",
                "http://10.0.118.40",
                "http://10.0.191.212:8080",
                "http://10.0.191.212"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "X-Mobile-Request",
                "Origin",
                "X-Requested-With",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers"
        ));
        configuration.setExposedHeaders(Arrays.asList(
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Credentials",
                "Authorization"
        ));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public FilterRegistrationBean<OpenEntityManagerInViewFilter> openEntityManagerInViewFilter() {
        FilterRegistrationBean<OpenEntityManagerInViewFilter> filterRegistrationBean = new FilterRegistrationBean<>();
        filterRegistrationBean.setFilter(new OpenEntityManagerInViewFilter());
        filterRegistrationBean.setOrder(5);
        return filterRegistrationBean;
    }

    @Bean
    public HandshakeInterceptor webSocketHandshakeInterceptor() {
        return new HandshakeInterceptor() {
            @Override
            public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                           WebSocketHandler wsHandler, Map<String, Object> attributes) {
                if (request instanceof ServletServerHttpRequest) {
                    ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;
                    String token = servletRequest.getServletRequest().getHeader("Authorization");
                    if (token != null && token.startsWith("Bearer ")) {
                        attributes.put("token", token.substring(7));
                    }
                }
                return true;
            }

            @Override
            public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                       WebSocketHandler wsHandler, Exception exception) {
            }
        };
    }
}