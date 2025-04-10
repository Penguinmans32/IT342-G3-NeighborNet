package com.example.neighbornetbackend.dto;

public class CreateRoomRequest {
    private String name;
    private String description;

    // Private constructor for builder
    private CreateRoomRequest() {}

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    // Static method to create builder
    public static Builder builder() {
        return new Builder();
    }

    // Builder class
    public static class Builder {
        private final CreateRoomRequest request;

        private Builder() {
            request = new CreateRoomRequest();
        }

        public Builder name(String name) {
            request.name = name;
            return this;
        }

        public Builder description(String description) {
            request.description = description;
            return this;
        }

        public CreateRoomRequest build() {
            return request;
        }
    }

    // Add setters for JSON deserialization
    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}