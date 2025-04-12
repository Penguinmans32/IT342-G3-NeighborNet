package com.example.neighbornetbackend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "study_rooms")
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private String hmsRoomId;
    private String creatorId;
    private LocalDateTime createdAt;
    private Integer activeParticipants = 0;

    public Room() {

    }

    public Room(Long id, String name, String description, String hmsRoomId, String creatorId, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.hmsRoomId = hmsRoomId;
        this.creatorId = creatorId;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getHmsRoomId() {
        return hmsRoomId;
    }

    public void setHmsRoomId(String hmsRoomId) {
        this.hmsRoomId = hmsRoomId;
    }

    public String getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(String creatorId) {
        this.creatorId = creatorId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getActiveParticipants() {
        return activeParticipants;
    }

    public void setActiveParticipants(Integer activeParticipants) {
        this.activeParticipants = activeParticipants;
    }
}