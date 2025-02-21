package com.example.neighbornetbackend.dto;

import com.example.neighbornetbackend.model.User;

public class CreatorDTO {
    private Long id;
    private String username;
    private String name;
    private String imageUrl;
    private String email;

    public CreatorDTO(Long id, String username, String imageUrl, String email) {
        this.id = id;
        this.username = username;
        this.imageUrl = imageUrl;
        this.email = email;
    }

    public CreatorDTO() {}

    public static CreatorDTO fromUser(User user) {
        CreatorDTO dto = new CreatorDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setImageUrl(user.getImageUrl());
        dto.setEmail(user.getEmail());
        return dto;
    }

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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}