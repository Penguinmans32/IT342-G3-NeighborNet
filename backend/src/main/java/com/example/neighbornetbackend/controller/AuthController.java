package com.example.neighbornetbackend.controller;


import com.example.neighbornetbackend.dto.*;
import com.example.neighbornetbackend.exception.TokenRefreshException;
import com.example.neighbornetbackend.model.RefreshToken;
import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.UserRepository;
import com.example.neighbornetbackend.security.CurrentUser;
import com.example.neighbornetbackend.security.CustomUserDetails;
import com.example.neighbornetbackend.security.JwtTokenProvider;
import com.example.neighbornetbackend.security.UserPrincipal;
import com.example.neighbornetbackend.service.EmailService;
import com.example.neighbornetbackend.service.EmailVerificationService;
import com.example.neighbornetbackend.service.RefreshTokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.mail.MessagingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final EmailVerificationService emailVerificationService;
    private final EmailService emailService;

    @Value("${app.mobile.header:X-Mobile-Request}")
    private String mobileHeaderName;

    public AuthController(AuthenticationManager authenticationManager, UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider, RefreshTokenService refreshTokenService, EmailVerificationService emailVerificationService, EmailService emailService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.refreshTokenService = refreshTokenService;
        this.emailVerificationService = emailVerificationService;
        this.emailService = emailService;
    }

    @Operation(
            summary = "Verify Email",
            description = "Verify user's email address using verification token"
    )
    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token,
                                         @RequestHeader(required = false) Map<String, String> headers) {
        boolean isMobileRequest = headers.containsKey(mobileHeaderName);

        try {
            emailVerificationService.verifyEmail(token, isMobileRequest);
            return ResponseEntity.ok("Email verified successfully!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @Operation(
            summary = "Register new user",
            description = "Create a new user account"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "User successfully registered"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Username/Email already exists"
            )
    })
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signupRequest,
                                          @RequestHeader Map<String, String> headers) {
        boolean isMobileRequest = headers.containsKey(mobileHeaderName.toLowerCase()) ||
                headers.containsKey(mobileHeaderName);

        logger.debug("Is mobile request: " + isMobileRequest);

        if(userRepository.existsByUsername(signupRequest.getUsername())) {
            return ResponseEntity.badRequest().body(com.example.neighbornetbackend.dto.ApiResponse.error("Error: Username is already taken!"));
        }
        if(userRepository.existsByEmail(signupRequest.getEmail())) {
            return ResponseEntity.badRequest().body(com.example.neighbornetbackend.dto.ApiResponse.error("Error: Email is already in use!"));
        }

        User user = new User();
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setEmailVerified(false);

        userRepository.save(user);

        try {
            String token = emailVerificationService.createVerificationToken(user, isMobileRequest);
            return ResponseEntity.ok(com.example.neighbornetbackend.dto.ApiResponse.success(null, "User registered successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(com.example.neighbornetbackend.dto.ApiResponse.error("User registered but failed to send verification email."));
        }
    }

    @Operation(
            summary = "Login User",
            description = "Authenticate a user and return JWT token"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Sucessfully authenticated",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Invalid credentials"
            )
    })
    @PostMapping(value = "/login",
            produces = MediaType.APPLICATION_JSON_VALUE,
            consumes = MediaType.APPLICATION_JSON_VALUE)
    @Transactional
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            logger.debug("Login attempt for username: '{}'", loginRequest.getUsername());
            User user = userRepository.findByUsernameOrEmail(
                    loginRequest.getUsername().trim(),
                    loginRequest.getUsername().trim()
            ).orElseThrow(() -> new RuntimeException("User not found"));

            logger.debug("Found user with username: '{}'", user.getUsername());

            if (!user.isEmailVerified()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(com.example.neighbornetbackend.dto.ApiResponse.error("Please verify your email before logging in."));
            }

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);

            refreshTokenService.invalidateAllUserTokens(user.getId());

            long activeTokens = refreshTokenService.countActiveTokensForUser(user.getId());
            if (activeTokens > 5) {
                refreshTokenService.invalidateAllUserTokens(user.getId());
            }

            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

            AuthResponse authResponse = new AuthResponse(
                    jwt,
                    refreshToken.getToken(),
                    "Bearer",
                    user.getUsername()
            );

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(com.example.neighbornetbackend.dto.ApiResponse.success(authResponse, "Login successful"));
        } catch (Exception e) {
            logger.error("Login failed", e);
            return ResponseEntity.badRequest()
                    .body(com.example.neighbornetbackend.dto.ApiResponse.error("Invalid username or password"));
        }
    }

    @PostMapping("/refreshtoken")
    public ResponseEntity<?> refreshtoken(@RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(token -> {
                    if (refreshTokenService.isRefreshTokenExpired(token)) {
                        refreshTokenService.deleteByUserId(token.getUser().getId());
                        throw new TokenRefreshException(token.getToken(),
                                "Refresh token was expired. Please make a new signin request");
                    }

                    String newAccessToken = tokenProvider.generateTokenFromUsername(token.getUser().getUsername());
                    return ResponseEntity.ok(new TokenRefreshResponse(newAccessToken, requestRefreshToken));
                })
                .orElseThrow(() -> new TokenRefreshException(requestRefreshToken,
                        "Refresh token is not in database!"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(@RequestBody LogOutRequest logOutRequest) {
        refreshTokenService.deleteByUserId(logOutRequest.getUserId());
        return ResponseEntity.ok("Log out successful!");
    }

    @PostMapping("/logout-all-devices")
    public ResponseEntity<?> logoutFromAllDevices(@RequestBody LogOutRequest logOutRequest) {
        refreshTokenService.invalidateAllUserTokens(logOutRequest.getUserId());
        return ResponseEntity.ok("Logged out from all devices successfully!");
    }

    @GetMapping("/check-token")
    public ResponseEntity<?> checkTokenValidity(@RequestParam String refreshToken) {
        return refreshTokenService.findByToken(refreshToken)
                .map(token -> {
                    boolean isExpired = refreshTokenService.isRefreshTokenExpired(token);
                    Map<String, Object> response = new HashMap<>();
                    response.put("token", refreshToken);
                    response.put("isExpired", isExpired);
                    response.put("username", token.getUser().getUsername());
                    response.put("expiryDate", token.getExpiryDate());

                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("message", "Token not found")));
    }

    @GetMapping("/user")
    public ResponseEntity<?> getCurrentUser(@CurrentUser UserPrincipal userPrincipal) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> userData = new HashMap<>();

        if (authentication != null && authentication.getPrincipal() != null) {
            if (authentication.getPrincipal() instanceof UserPrincipal) {
                userData.put("id", userPrincipal.getId());
                userData.put("username", userPrincipal.getUsername());
                userData.put("email", userPrincipal.getEmail());
                userData.put("role", userPrincipal.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.toList()));
            } else if (authentication.getPrincipal() instanceof OAuth2User) {
                OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
                Map<String, Object> attributes = oauth2User.getAttributes();

                String email = (String) attributes.get("mail");
                if (email == null) {
                    email = (String) attributes.get("userPrincipalName");
                }

                String name = (String) attributes.get("displayName");
                if (name == null) {
                    name = (String) attributes.get("givenName");
                }

                String finalEmail = email;
                String finalName = name;
                User user = userRepository.findByEmail(email)
                        .orElseGet(() -> {
                            User newUser = new User();
                            newUser.setEmail(finalEmail);
                            newUser.setUsername(finalName);
                            newUser.setEmailVerified(true);
                            return userRepository.save(newUser);
                        });

                userData.put("id", user.getId());
                userData.put("username", name);
                userData.put("email", email);
                userData.put("role", Collections.singletonList("ROLE_USER"));
                userData.put("provider", "microsoft");
            }
            return ResponseEntity.ok(userData);
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PostMapping("/verify-mobile")
    public ResponseEntity<?> verifyMobileEmail(@RequestBody VerificationRequest request) {
        try {
            emailVerificationService.verifyEmail(request.getOtp(), true);
            return ResponseEntity.ok(com.example.neighbornetbackend.dto.ApiResponse.success(null, "Email verified successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(com.example.neighbornetbackend.dto.ApiResponse.error(e.getMessage()));
        }
    }
}
