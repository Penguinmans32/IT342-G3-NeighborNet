package com.example.neighbornetbackend.dto;

import java.util.List;
import java.util.Map;

public class UpdateProfileRequest {
    private String bio;
    private List<UserSkillDTO> skills;
    private List<String> interests;
    private Map<String, String> socialLinks;

    // Getters and setters
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

    public List<String> getInterests() {
        return interests;
    }

    public void setInterests(List<String> interests) {
        this.interests = interests;
    }

    public Map<String, String> getSocialLinks() {
        return socialLinks;
    }

    public void setSocialLinks(Map<String, String> socialLinks) {
        this.socialLinks = socialLinks;
    }
}