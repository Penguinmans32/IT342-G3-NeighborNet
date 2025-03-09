package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {
    @Query("SELECT p FROM Post p ORDER BY p.createdAt DESC")
    Page<Post> findAllPosts(Pageable pageable);

    @Query("SELECT DISTINCT p FROM Post p LEFT JOIN FETCH p.likes WHERE p.id = :postId")
    Optional<Post> findByIdWithLikes(@Param("postId") Long postId);

    @Query("SELECT p FROM Post p LEFT JOIN FETCH p.share LEFT JOIN FETCH p.shares LEFT JOIN FETCH p.comments LEFT JOIN FETCH p.likes WHERE p.id = :id")
    Optional<Post> findByIdWithRelationships(@Param("id") Long id);
}