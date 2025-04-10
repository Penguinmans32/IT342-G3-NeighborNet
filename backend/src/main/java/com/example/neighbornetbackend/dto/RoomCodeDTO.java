package com.example.neighbornetbackend.dto;

public class RoomCodeDTO {
    private String code;
    private String role;
    private String roomId;

    public RoomCodeDTO(String code, String role, String roomId) {
        this.code = code;
        this.role = role;
        this.roomId = roomId;
    }

    // Getters
    public String getCode() {
        return code;
    }

    public String getRole() {
        return role;
    }

    public String getRoomId() {
        return roomId;
    }
}