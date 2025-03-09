package com.example.neighbornetbackend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.List;

public class PostDTO {
    private Long id;
    private UserDTO author;
    private String content;
    private String imageUrl;
    private int likesCount;
    private int commentsCount;
    private int sharesCount;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime createdAt;

    @JsonProperty("isLiked")
    private boolean isLiked;
    private boolean isShared;
    private List<CommentDTO> comments;
    private PostDTO originalPost;
    private UserDTO sharedBy;
    private boolean isEdited;


    public PostDTO(Long id, UserDTO author, String content, String imageUrl,
                   int likesCount, int commentsCount, int sharesCount,
                   LocalDateTime createdAt, boolean isLiked, boolean isShared,
                   List<CommentDTO> comments, PostDTO originalPost, UserDTO sharedBy, boolean isEdited) {
        this.id = id;
        this.author = author;
        this.content = content;
        this.imageUrl = imageUrl;
        this.likesCount = likesCount;
        this.commentsCount = commentsCount;
        this.sharesCount = sharesCount;
        this.createdAt = createdAt;
        this.isLiked = isLiked;
        this.isShared = isShared;
        this.comments = comments;
        this.originalPost = originalPost;
        this.sharedBy = sharedBy;
        this.isEdited = isEdited;
    }



    public PostDTO(Long id, UserDTO author, String content, String imageUrl,
                   int likesCount, int commentsCount, int sharesCount,
                   LocalDateTime createdAt, boolean isLiked,
                   List<CommentDTO> comments) {
        this(id, author, content, imageUrl, likesCount, commentsCount, sharesCount,
                createdAt, isLiked, false, comments, null, null, false);
    }

    public PostDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserDTO getAuthor() {
        return author;
    }

    public void setAuthor(UserDTO author) {
        this.author = author;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public int getLikesCount() {
        return likesCount;
    }

    public void setLikesCount(int likesCount) {
        this.likesCount = likesCount;
    }

    public int getCommentsCount() {
        return commentsCount;
    }

    public void setCommentsCount(int commentsCount) {
        this.commentsCount = commentsCount;
    }

    public int getSharesCount() {
        return sharesCount;
    }

    public void setSharesCount(int sharesCount) {
        this.sharesCount = sharesCount;
    }

    public boolean isLiked() {
        return isLiked;
    }

    public void setLiked(boolean liked) {
        isLiked = liked;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<CommentDTO> getComments() {
        return comments;
    }

    public void setComments(List<CommentDTO> comments) {
        this.comments = comments;
    }

    public boolean isShared() {
        return isShared;
    }

    public void setShared(boolean shared) {
        isShared = shared;
    }

    public PostDTO getOriginalPost() {
        return originalPost;
    }

    public void setOriginalPost(PostDTO originalPost) {
        this.originalPost = originalPost;
    }

    public UserDTO getSharedBy() {
        return sharedBy;
    }

    public void setSharedBy(UserDTO sharedBy) {
        this.sharedBy = sharedBy;
    }

    public boolean getIsEdited() {
        return isEdited;
    }

    public void setIsEdited(boolean isEdited) {
        this.isEdited = isEdited;
    }
}