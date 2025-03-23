package com.example.neighbornetbackend.dto;

import com.example.neighbornetbackend.model.User;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class UserDTO {
    private Long id;
    private String username;
    private String imageUrl;
    private String email;
    private String bio;
    private List<UserSkillDTO> skills;
    private List<String> interests;
    private Map<String, String> socialLinks;
    private int followersCount;
    private int followingCount;
    private boolean isFollowing;


    public UserDTO(Long id, String username, String imageUrl) {
        this.id = id;
        this.username = username;
        this.imageUrl = imageUrl;
    }

    public UserDTO(Long id, String username, String imageUrl, String email, String bio) {
        this.id = id;
        this.username = username;
        this.imageUrl = imageUrl;
        this.email = email;
        this.bio = bio;
    }

    public static UserDTO fromEntity(User user, User currentUser) {
        UserDTO dto = new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getImageUrl(),
                user.getEmail(),
                user.getBio()
        );

        dto.setSkills(user.getSkills().stream()
                .map(skill -> new UserSkillDTO(skill.getName(), skill.getProficiencyLevel()))
                .collect(Collectors.toList()));

        dto.setInterests(user.getInterests().stream()
                .map(interest -> interest.getName())
                .collect(Collectors.toList()));

        Map<String, String> socialLinks = new HashMap<>();
        socialLinks.put("github", user.getGithubUrl());
        socialLinks.put("twitter", user.getTwitterUrl());
        socialLinks.put("linkedin", user.getLinkedinUrl());
        socialLinks.put("facebook", user.getFacebookUrl());
        dto.setSocialLinks(socialLinks);
        dto.setFollowersCount(user.getFollowers().size());
        dto.setFollowingCount(user.getFollowing().size());
        dto.setFollowing(currentUser != null && user.getFollowers().contains(currentUser));

        return dto;
    }

    public static UserDTO fromEntity(User user) {
        return fromEntity(user, null);
    }

    public UserDTO() {}

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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public List<UserSkillDTO> getSkills() {
        return skills;
    }

    public void setSkills(List<UserSkillDTO> skills) {
        this.skills = skills;
    }

    public Map<String, String> getSocialLinks() {
        return socialLinks;
    }

    public void setSocialLinks(Map<String, String> socialLinks) {
        this.socialLinks = socialLinks;
    }

    public List<String> getInterests() {
        return interests;
    }

    public void setInterests(List<String> interests) {
        this.interests = interests;
    }

    public boolean isFollowing() {
        return isFollowing;
    }

    public void setFollowing(boolean following) {
        isFollowing = following;
    }

    public int getFollowingCount() {
        return followingCount;
    }

    public void setFollowingCount(int followingCount) {
        this.followingCount = followingCount;
    }

    public int getFollowersCount() {
        return followersCount;
    }

    public void setFollowersCount(int followersCount) {
        this.followersCount = followersCount;
    }
}