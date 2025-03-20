package com.example.neighbornetbackend.dto;

public class UserSkillDTO {
    private String name;
    private Integer level;

    public UserSkillDTO() {}

    public UserSkillDTO(String name, Integer level) {
        this.name = name;
        this.level = level;
    }

    // Getters and setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }
}