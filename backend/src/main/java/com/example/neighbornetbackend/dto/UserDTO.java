package com.example.neighbornetbackend.dto;

import com.example.neighbornetbackend.model.User;

public class UserDTO {
    private Long id;
    private String username;
    private String imageUrl;

    public UserDTO(Long id, String username, String imageUrl) {
        this.id = id;
        this.username = username;
        this.imageUrl = imageUrl;
    }

    public static UserDTO fromEntity(User user) {
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getImageUrl()
        );
    }

    public UserDTO() {}

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}