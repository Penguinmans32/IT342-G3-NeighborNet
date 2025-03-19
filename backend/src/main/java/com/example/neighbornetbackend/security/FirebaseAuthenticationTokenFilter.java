package com.example.neighbornetbackend.security;

import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.UserRepository;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class FirebaseAuthenticationTokenFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseAuthenticationTokenFilter.class);

    private final FirebaseAuth firebaseAuth;
    private final UserRepository userRepository;
    private final CustomUserDetailsService userDetailsService;

    public FirebaseAuthenticationTokenFilter(FirebaseAuth firebaseAuth,
                                             UserRepository userRepository,
                                             CustomUserDetailsService userDetailsService) {
        this.firebaseAuth = firebaseAuth;
        this.userRepository = userRepository;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String token = getToken(request);
        //logger.debug("Processing token: {}", token != null ? "present" : "null");

        if (token != null && isFirebaseToken(token)) {
            logger.debug("Token identified as Firebase token");
            try {
                FirebaseToken decodedToken = firebaseAuth.verifyIdToken(token);
                String email = decodedToken.getEmail();
                String name = decodedToken.getName();
                String photoUrl = decodedToken.getPicture();

                if (email != null) {
                    logger.debug("Processing Firebase token for email: {}", email);
                    User user = userRepository.findByEmail(email)
                            .orElseGet(() -> {
                                User newUser = new User();
                                newUser.setEmail(email);
                                newUser.setUsername(name != null ? name : email.substring(0, email.indexOf('@')));
                                newUser.setEmailVerified(true);
                                newUser.setProvider("firebase");
                                newUser.setProviderId(decodedToken.getUid());
                                newUser.setImageUrl(photoUrl);
                                newUser.setRole("ROLE_USER");
                                newUser.setPassword("");
                                logger.debug("Creating new user for Firebase authentication: {}", email);
                                return userRepository.save(newUser);
                            });

                    UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities());

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    logger.info("Successfully authenticated Firebase user with email: {}", email);
                } else {
                    logger.warn("Firebase token did not contain an email");
                }
            } catch (FirebaseAuthException e) {
                logger.error("Firebase Authentication failed: {}", e.getMessage());
            } catch (Exception e) {
                logger.error("Error processing Firebase authentication: {}", e.getMessage());
            }
        } else {
            //logger.debug("Token is not a Firebase token, passing to next filter");
        }

        filterChain.doFilter(request, response);
    }

    private String getToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            logger.debug("Found Bearer token in request");
            return token;
        }
        //logger.debug("No Bearer token found in request");
        return null;
    }

    private boolean isFirebaseToken(String token) {
        try {
            // Firebase tokens are JSON Web Tokens with three segments
            String[] segments = token.split("\\.");
            if (segments.length != 3) {
                logger.debug("Token does not have three segments, not a Firebase token");
                return false;
            }

            // Additional Firebase token validation
            // Firebase tokens are typically longer and have specific claims
            boolean isFirebaseToken = token.length() > 500;
            //logger.debug("Token length check for Firebase token: {}", isFirebaseToken);
            return isFirebaseToken;

        } catch (Exception e) {
            //logger.error("Error checking Firebase token: {}", e.getMessage());
            return false;
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        // Skip filter for non-authenticated endpoints
        boolean shouldNotFilter = path.startsWith("/api/auth/login") ||
                path.startsWith("/api/auth/signup") ||
                path.startsWith("/api/auth/refreshtoken");

        //logger.debug("Should not filter request to {}: {}", path, shouldNotFilter);
        return shouldNotFilter;
    }
}