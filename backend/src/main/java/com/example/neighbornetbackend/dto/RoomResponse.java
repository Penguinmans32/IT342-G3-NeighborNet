package com.example.neighbornetbackend.dto;

import java.util.Map;

public class RoomResponse {
    private String id;
    private String name;
    private String description;
    private String token;
    private Map<String, String> codes;


    // Private constructor for builder
    private RoomResponse() {}

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getToken() {
        return token;
    }

    public Map<String, String> getCodes() {
        return codes;
    }

    // Static method to create builder
    public static Builder builder() {
        return new Builder();
    }

    // Builder class
    public static class Builder {
        private final RoomResponse roomResponse;

        private Builder() {
            roomResponse = new RoomResponse();
        }

        public Builder id(String id) {
            roomResponse.id = id;
            return this;
        }

        public Builder name(String name) {
            roomResponse.name = name;
            return this;
        }

        public Builder description(String description) {
            roomResponse.description = description;
            return this;
        }

        public Builder token(String token) {
            roomResponse.token = token;
            return this;
        }

        public RoomResponse build() {
            return roomResponse;
        }

        public Builder codes(Map<String, String> codes) {
            roomResponse.codes = codes;
            return this;
        }
    }
}