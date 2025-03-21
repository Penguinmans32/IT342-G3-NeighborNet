package com.example.neighbornetbackend.repository;


import com.example.neighbornetbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByUsernameOrEmail(String username, String email);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    long countByEmailVerified(boolean emailVerified);

    long countByEmailVerifiedAndCreatedDateBefore(boolean emailVerified, LocalDateTime date);
}
