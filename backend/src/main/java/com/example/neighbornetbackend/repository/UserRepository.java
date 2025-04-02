package com.example.neighbornetbackend.repository;


import com.example.neighbornetbackend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByUsernameOrEmail(String username, String email);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    long countByEmailVerified(boolean emailVerified);

    long countByEmailVerifiedAndCreatedDateBefore(boolean emailVerified, LocalDateTime date);

    List<User> findTop5ByOrderByCreatedDateDesc();

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdDate <= :date")
    long countByCreatedDateBefore(@Param("date") LocalDateTime date);

    @Query("SELECT u FROM User u WHERE " +
            "LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<User> searchUsers(@Param("search") String search, Pageable pageable);

    @Query("SELECT COUNT(u) FROM User u WHERE u.emailVerified = true")
    long countActiveUsers();

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdDate >= :startDate")
    long countNewUsersFrom(@Param("startDate") LocalDateTime startDate);
}
