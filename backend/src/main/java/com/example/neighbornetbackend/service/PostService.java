package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.dto.CommentDTO;
import com.example.neighbornetbackend.dto.PostDTO;
import com.example.neighbornetbackend.dto.UserDTO;
import com.example.neighbornetbackend.exception.ResourceNotFoundException;
import com.example.neighbornetbackend.exception.UnauthorizedException;
import com.example.neighbornetbackend.model.Comment;
import com.example.neighbornetbackend.model.Post;
import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.PostRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.core.task.AsyncTaskExecutor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final AsyncTaskExecutor notificationExecutor;


    private final PostRepository postRepository;
    private final UserService userService;
    private final NotificationService notificationService;
    private final PostImageStorageService postImageStorageService;

    private static final Logger logger = LoggerFactory.getLogger(PostService.class);

    public PostService(
            PostRepository postRepository,
            UserService userService,
            NotificationService notificationService,
            PostImageStorageService postImageStorageService,
            @Qualifier("notificationTaskExecutor") AsyncTaskExecutor notificationExecutor) {
        this.postRepository = postRepository;
        this.userService = userService;
        this.notificationService = notificationService;
        this.postImageStorageService = postImageStorageService;
        this.notificationExecutor = notificationExecutor;
    }

    private UserDTO convertToAuthorDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getImageUrl()
        );
    }

    private PostDTO convertToDTO(Post post, Long currentUserId) {
        PostDTO originalPostDTO = null;
        UserDTO sharedByDTO = null;

        if (post.getOriginalPost() != null) {
            originalPostDTO = new PostDTO(
                    post.getOriginalPost().getId(),
                    convertToAuthorDTO(post.getOriginalPost().getUser()),
                    post.getOriginalPost().getContent(),
                    post.getOriginalPost().getImageUrl(),
                    post.getOriginalPost().getLikes().size(),
                    post.getOriginalPost().getComments().size(),
                    post.getOriginalPost().getShares().size(),
                    post.getOriginalPost().getCreatedAt(),
                    isLikedByUser(post.getOriginalPost(), currentUserId),
                    false,
                    post.getOriginalPost().getComments().stream()
                            .map(comment -> convertToCommentDTO(comment, currentUserId))
                            .collect(Collectors.toList()),
                    null,
                    null,
                    post.getOriginalPost().isEdited()
            );
            sharedByDTO = convertToAuthorDTO(post.getUser());
        }

        return new PostDTO(
                post.getId(),
                convertToAuthorDTO(post.getUser()),
                post.getContent(),
                post.getImageUrl(),
                post.getLikes().size(),
                post.getComments().size(),
                post.getShares().size(),
                post.getCreatedAt(),
                isLikedByUser(post, currentUserId),
                post.getOriginalPost() != null,
                post.getComments().stream()
                        .map(comment -> convertToCommentDTO(comment, currentUserId))
                        .collect(Collectors.toList()),
                originalPostDTO,
                sharedByDTO,
                post.isEdited()
        );
    }


    private CommentDTO convertToCommentDTO(Comment comment, Long currentUserId) {
        return new CommentDTO(
                comment.getId(),
                convertToAuthorDTO(comment.getUser()),
                comment.getContent(),
                comment.getLikes().size(),
                isCommentLikedByUser(comment, currentUserId),
                comment.getCreatedAt()
        );
    }

    @Caching(evict = {
            @CacheEvict(value = "postPages", allEntries = true),
            @CacheEvict(value = "posts", allEntries = true)
    })
    @Transactional
    public PostDTO createPost(String content, String imageUrl, Long userId) {
        User user = userService.getUserById(userId);
        Post post = new Post();
        post.setUser(user);
        post.setContent(content);
        post.setImageUrl(imageUrl);
        post.setCreatedAt(LocalDateTime.now(ZoneOffset.UTC));
        Post savedPost = postRepository.save(post);
        return convertToDTO(savedPost, userId);
    }


    @CacheEvict(value = "posts", key = "'post_' + #postId")
    @Transactional
    public PostDTO likePost(Long postId, Long userId) {
        Post post = postRepository.findByIdWithLikes(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        User user = userService.getUserById(userId);

        boolean wasLiked = post.getLikes().removeIf(likedUser -> likedUser.getId().equals(userId));
        if (!wasLiked) {
            post.getLikes().add(user);
            if (!post.getUser().getId().equals(userId)) {
                sendNotificationAsync(
                        post.getUser().getId(),
                        "New Like",
                        user.getUsername() + " liked your post: " + truncateContent(post.getContent()),
                        "POST_LIKE"
                );
            }
        }

        Post savedPost = postRepository.save(post);
        return convertToDTO(savedPost, userId);
    }


    private boolean isLikedByUser(Post post, Long userId) {
        return post.getLikes().stream()
                .anyMatch(user -> user.getId().equals(userId));
    }

    @Transactional(readOnly = true)
    public Page<PostDTO> getPosts(int page, int size, Long currentUserId) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<Post> posts = postRepository.findAllPosts(pageable);

            List<Long> postIds = posts.getContent().stream()
                    .map(Post::getId)
                    .collect(Collectors.toList());

            List<Post> detailedPosts = new ArrayList<>();
            for (Long id : postIds) {
                postRepository.findByIdWithDetails(id)
                        .ifPresent(detailedPosts::add);
            }

            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), detailedPosts.size());

            Page<Post> detailedPage = new PageImpl<>(
                    detailedPosts.subList(start, end),
                    pageable,
                    posts.getTotalElements()
            );

            return detailedPage.map(post -> convertToDTO(post, currentUserId));
        } catch (Exception e) {
            logger.error("Error fetching posts", e);
            return Page.empty(PageRequest.of(page, size));
        }
    }

    private boolean isCommentLikedByUser(Comment comment, Long userId) {
        return comment.getLikes().stream()
                .anyMatch(user -> user.getId().equals(userId));
    }

    @CacheEvict(value = "posts", key = "'post_' + #postId")
    @Transactional
    public PostDTO addComment(Long postId, String content, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        User user = userService.getUserById(userId);

        Comment comment = new Comment();
        comment.setContent(content);
        comment.setUser(user);
        comment.setPost(post);
        post.getComments().add(comment);

        if (!post.getUser().getId().equals(userId)) {
            sendNotificationAsync(
                    post.getUser().getId(),
                    "New Comment",
                    user.getUsername() + " liked your post: " + truncateContent(post.getContent()),
                    "POST_COMMENT"
            );
        }

        Post savedPost = postRepository.save(post);
        return convertToDTO(savedPost, userId);
    }

    @CacheEvict(value = "posts", key = "'post_' + #postId")
    @Transactional
    public PostDTO deleteComment(Long postId, Long commentId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        boolean removed = post.getComments().removeIf(comment ->
                comment.getId().equals(commentId) &&
                        (comment.getUser().getId().equals(userId) || post.getUser().getId().equals(userId))
        );

        if (!removed) {
            throw new ResourceNotFoundException("Comment not found or you don't have permission to delete it");
        }

        Post savedPost = postRepository.save(post);
        return convertToDTO(savedPost, userId);
    }


    @CacheEvict(value = "posts", key = "'post_' + #postId")
    @Transactional
    public PostDTO likeComment(Long postId, Long commentId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        User user = userService.getUserById(userId);

        Comment comment = post.getComments().stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        boolean wasLiked = comment.getLikes().removeIf(likedUser -> likedUser.getId().equals(userId));
        if (!wasLiked) {
            comment.getLikes().add(user);
            if (!comment.getUser().getId().equals(userId)) {
                sendNotificationAsync(
                        post.getUser().getId(),
                        "Comment Liked",
                        user.getUsername() + " liked your post: " + truncateContent(post.getContent()),
                        "COMMENT_LIKED"
                );
            }
        }

        Post savedPost = postRepository.save(post);
        return convertToDTO(savedPost, userId);
    }

    @CacheEvict(value = "postPages", allEntries = true)
    @Transactional
    public PostDTO sharePost(Long postId, String content, Long userId) {
        Post originalPost = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        User user = userService.getUserById(userId);

        if (originalPost.getUser().getId().equals(userId)) {
            throw new IllegalStateException("You cannot share your own post");
        }

        Post sharedPost = new Post();
        sharedPost.setUser(user);
        sharedPost.setContent(content);
        sharedPost.setOriginalPost(originalPost);

        sendNotificationAsync(
                originalPost.getUser().getId(),
                "Post Shared",
                user.getUsername() + " liked your post: " + truncateContent(originalPost.getContent()),
                "POST_SHARE"
        );

        Post savedPost = postRepository.save(sharedPost);
        return convertToDTO(savedPost, userId);
    }

    @Caching(evict = {
            @CacheEvict(value = "posts", key = "'post_' + #postId"),
            @CacheEvict(value = "postPages", allEntries = true)
    })
    @Transactional
    public void deletePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        if (userId != null && !post.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You can only delete your own posts");
        }

        if (post.getImageUrl() != null && !post.getImageUrl().isEmpty()) {
            try {
                String filename = post.getImageUrl().substring(post.getImageUrl().lastIndexOf('/') + 1);
                postImageStorageService.deletePostImage(filename);
            } catch (IOException e) {
                logger.error("Failed to delete post image: " + e.getMessage());
            }
        }

        post.getShare().clear();
        post.getShares().clear();
        post.getLikes().clear();
        post.getComments().clear();

        postRepository.delete(post);
    }

    @Caching(evict = {
            @CacheEvict(value = "posts", key = "'post_' + #postId"),
            @CacheEvict(value = "postPages", allEntries = true)
    })
    @Transactional
    public PostDTO updatePost(Long postId, String content, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        if (!post.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You can only edit your own posts");
        }

        post.setContent(content);
        post.setEdited(true);
        Post updatedPost = postRepository.save(post);
        return convertToDTO(updatedPost, userId);
    }

    @Transactional
    public PostDTO updateComment(Long postId, Long commentId, String content, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        Comment comment = post.getComments().stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (!comment.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You can only edit your own comments");
        }

        comment.setContent(content);
        Post savedPost = postRepository.save(post);
        return convertToDTO(savedPost, userId);
    }

    private String truncateContent(String content) {
        if (content == null) return "";
        int maxLength = 50;
        return content.length() > maxLength
                ? content.substring(0, maxLength) + "..."
                : content;
    }

    @Transactional(readOnly = true)
    public Page<PostDTO> getAllPosts(int page, int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<Post> posts = postRepository.findAllPosts(pageable);

            return posts.map(post -> convertToDTO(post, null));
        } catch (Exception e) {
            logger.error("Error fetching all posts: ", e);
            throw new RuntimeException("Error fetching posts: " + e.getMessage());
        }
    }


    @Transactional(readOnly = true)
    public Page<PostDTO> searchPosts(String query, int page, int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<Post> posts = postRepository.searchPosts(query, pageable);

            return posts.map(post -> convertToDTO(post, null));
        } catch (Exception e) {
            logger.error("Error searching posts: ", e);
            throw new RuntimeException("Error searching posts: " + e.getMessage());
        }
    }

    public Page<CommentDTO> getPostComments(Long postId, int page, int size, Long userId) {
        Pageable pageable = PageRequest.of(page, size);
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        int start = page * size;
        int end = Math.min(start + size, post.getComments().size());

        if (start >= post.getComments().size()) {
            return Page.empty(pageable);
        }

        List<CommentDTO> commentDTOs = post.getComments().stream()
                .skip(start)
                .limit(size)
                .map(comment -> convertToCommentDTO(comment, userId))
                .collect(Collectors.toList());

        return new PageImpl<>(commentDTOs, pageable, post.getComments().size());
    }

    private void sendNotificationAsync(Long userId, String title, String message, String type) {
        notificationExecutor.execute(() -> {
            try {
                notificationService.createAndSendNotification(userId, title, message, type);
            } catch (Exception e) {
                logger.error("Failed to send notification: " + e.getMessage(), e);
            }
        });
    }
}
