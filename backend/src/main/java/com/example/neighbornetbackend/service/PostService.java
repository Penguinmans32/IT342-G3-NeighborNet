package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.dto.CommentDTO;
import com.example.neighbornetbackend.dto.PostDTO;
import com.example.neighbornetbackend.dto.UserDTO;
import com.example.neighbornetbackend.exception.ResourceNotFoundException;
import com.example.neighbornetbackend.exception.UnauthorizedException;
import com.example.neighbornetbackend.model.Comment;
import com.example.neighbornetbackend.model.Post;
import com.example.neighbornetbackend.model.Share;
import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.PostRepository;
import org.hibernate.Hibernate;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.stream.Collectors;

@Service
public class PostService {
    private final PostRepository postRepository;
    private final UserService userService;

    public PostService(PostRepository postRepository, UserService userService) {
        this.postRepository = postRepository;
        this.userService = userService;
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


    @Transactional
    public PostDTO likePost(Long postId, Long userId) {
        Post post = postRepository.findByIdWithLikes(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        User user = userService.getUserById(userId);

        boolean isLiked = post.getLikes().removeIf(likedUser -> likedUser.getId().equals(userId));
        if (!isLiked) {
            post.getLikes().add(user);
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
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Post> posts = postRepository.findAllPosts(pageable);

        if (posts.isEmpty()) {
            return Page.empty(pageable);
        }

        posts.getContent().forEach(post -> {
            Hibernate.initialize(post.getLikes());
            if (post.getOriginalPost() != null) {
                Hibernate.initialize(post.getOriginalPost().getLikes());
            }
        });

        return posts.map(post -> convertToDTO(post, currentUserId));
    }

    private boolean isCommentLikedByUser(Comment comment, Long userId) {
        return comment.getLikes().stream()
                .anyMatch(user -> user.getId().equals(userId));
    }

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

        Post savedPost = postRepository.save(post);
        return convertToDTO(savedPost, userId);
    }

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


    @Transactional
    public PostDTO likeComment(Long postId, Long commentId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        User user = userService.getUserById(userId);

        Comment comment = post.getComments().stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        boolean isLiked = comment.getLikes().removeIf(likedUser -> likedUser.getId().equals(userId));
        if (!isLiked) {
            comment.getLikes().add(user);
        }

        Post savedPost = postRepository.save(post);
        return convertToDTO(savedPost, userId);
    }

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

        Post savedPost = postRepository.save(sharedPost);
        return convertToDTO(savedPost, userId);
    }


    private boolean isSharedByUser(Post post, Long userId) {
        return post.getShares().stream()
                .anyMatch(share -> share.getUser().getId().equals(userId));
    }

    @Transactional
    public void deletePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        if (!post.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You can only delete your own posts");
        }

        post.getShare().clear();
        post.getShares().clear();
        post.getLikes().clear();
        post.getComments().clear();

        postRepository.delete(post);
    }

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
}