package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {
    @Query("SELECT DISTINCT p FROM Post p ORDER BY p.createdAt DESC")
    Page<Post> findAllPosts(Pageable pageable);

    @Query("SELECT p FROM Post p LEFT JOIN FETCH p.likes LEFT JOIN FETCH p.comments " +
            "LEFT JOIN FETCH p.user WHERE p.id = :postId")
    Optional<Post> findByIdWithDetails(@Param("postId") Long postId);

    @Query("SELECT DISTINCT p FROM Post p LEFT JOIN FETCH p.likes WHERE p.id = :postId")
    Optional<Post> findByIdWithLikes(@Param("postId") Long postId);

    List<Post> findTop5ByOrderByCreatedAtDesc();

    @Query("SELECT COUNT(p) FROM Post p WHERE p.createdAt >= :since")
    long countRecentPosts(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(DISTINCT p.user) FROM Post p WHERE p.createdAt >= :since")
    long countActiveUsers(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(l) + COUNT(s) FROM Post p LEFT JOIN p.likes l LEFT JOIN p.shares s")
    long countTotalEngagements();

    @Query("SELECT p FROM Post p WHERE " +
            "LOWER(p.content) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.user.username) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Post> searchPosts(@Param("query") String query, Pageable pageable);
}