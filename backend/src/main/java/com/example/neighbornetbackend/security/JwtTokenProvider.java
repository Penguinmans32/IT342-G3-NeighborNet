package com.example.neighbornetbackend.security;

import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.UserRepository;
import com.example.neighbornetbackend.service.CustomOAuth2UserService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.security.Key;
import java.util.Date;
import java.util.Map;

@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(CustomOAuth2UserService.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private int jwtExpiration;

    private Key key;

    @Autowired
    private UserRepository userRepository;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(Authentication authentication) {
        String username;
        Long userId = null;
        String role = null;

        if (authentication.getPrincipal() instanceof UserPrincipal) {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            username = userPrincipal.getEmail();
            userId = userPrincipal.getId();
            role = userPrincipal.getAuthorities().stream()
                    .findFirst()
                    .map(GrantedAuthority::getAuthority)
                    .orElse("ROLE_USER");
            log.info("Generating token for UserPrincipal with email: {}, ID: {}, and role: {}",
                    username, userId, role);
        } else if (authentication.getPrincipal() instanceof OAuth2User) {
            OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
            Map<String, Object> attributes = oauth2User.getAttributes();
            log.info("OAuth2User attributes: {}", attributes);

            username = (String) attributes.get("mail");
            if (username == null) {
                username = (String) attributes.get("email");
            }
            if (username == null) {
                username = (String) attributes.get("userPrincipalName");
            }

            if (username == null) {
                throw new IllegalStateException("Could not find email in OAuth2 user attributes");
            }

            User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new IllegalStateException("User not found"));
            userId = user.getId();
            role = user.getRole();

            log.info("Generating token for OAuth2User with email: {}, ID: {}, and role: {}",
                    username, userId, role);
        } else {
            throw new IllegalArgumentException("Unsupported principal type: " +
                    authentication.getPrincipal().getClass());
        }

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
                .setSubject(username)
                .claim("user_id", userId)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        String username = claims.getSubject();
        log.info("Extracted username from token: {}", username);
        return username;
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public String generateTokenFromUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
                .setSubject(username)
                .claim("user_id", user.getId())
                .claim("role", user.getRole())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key)
                .compact();
    }
}