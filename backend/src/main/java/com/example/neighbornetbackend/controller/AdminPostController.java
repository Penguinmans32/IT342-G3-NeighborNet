package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.dto.ApiResponse;
import com.example.neighbornetbackend.dto.PostDTO;
import com.example.neighbornetbackend.exception.ResourceNotFoundException;
import com.example.neighbornetbackend.model.Post;
import com.example.neighbornetbackend.repository.PostRepository;
import com.example.neighbornetbackend.service.ItemService;
import com.example.neighbornetbackend.service.PostImageStorageService;
import com.example.neighbornetbackend.service.PostService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/posts")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminPostController {
    private final PostService postService;
    private final PostRepository postRepository;
    private final PostImageStorageService postImageStorageService;

    private static final Logger logger = LoggerFactory.getLogger(AdminPostController.class);

    public AdminPostController(PostService postService,
                               PostRepository postRepository,
                               PostImageStorageService postImageStorageService) {
        this.postService = postService;
        this.postRepository = postRepository;
        this.postImageStorageService = postImageStorageService;
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getPostStats() {
        try {
            Map<String, Object> stats = new HashMap<>();

            long totalPosts = postRepository.count();
            stats.put("totalPosts", totalPosts);

            long totalEngagements = postRepository.countTotalEngagements();
            stats.put("totalEngagements", totalEngagements);

            LocalDateTime yesterday = LocalDateTime.now().minusHours(24);
            long recentPosts = postRepository.countRecentPosts(yesterday);
            stats.put("recentPosts", recentPosts);

            LocalDateTime lastWeek = LocalDateTime.now().minusDays(7);
            long activeUsers = postRepository.countActiveUsers(lastWeek);
            stats.put("activeUsers", activeUsers);

            return ResponseEntity.ok(ApiResponse.success(stats, "Post stats retrieved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching post stats: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllPosts(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            Page<PostDTO> posts;
            if (search != null && !search.trim().isEmpty()) {
                posts = postService.searchPosts(search.trim(), page, size);
            } else {
                posts = postService.getAllPosts(page, size);
            }
            return ResponseEntity.ok(ApiResponse.success(posts, "Posts retrieved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching posts: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        try {
            postService.deletePost(id, null);
            return ResponseEntity.ok(ApiResponse.success(null, "Post deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error deleting post: " + e.getMessage()));
        }
    }
}