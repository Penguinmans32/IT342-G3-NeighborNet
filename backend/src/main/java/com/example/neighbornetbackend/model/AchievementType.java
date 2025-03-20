package com.example.neighbornetbackend.model;

public enum AchievementType {
    FIRST_CLASS_CREATED("First Teacher", "Created your first class", "BookOpen", 1),
    FIRST_ITEM_POSTED("Sharing Starter", "Posted your first item", "Package", 1),
    CLASS_CREATOR("Class Master", "Created 10 classes", "Award", 10),
    ITEM_SHARER("Sharing Expert", "Posted 10 items", "Package", 10),
    FIRST_BORROWER("First Borrower", "Borrowed your first item", "HandShake", 1),
    FIRST_LENDER("First Lender", "Lent your first item", "Gift", 1),
    FEEDBACK_GIVER("Feedback Star", "Left your first class feedback", "MessageCircle", 1),
    COMMUNITY_BEGINNER("Community Starter", "Reached 25% community score", "Star", 25),
    COMMUNITY_EXPERT("Community Expert", "Reached 50% community score", "Star", 50),
    COMMUNITY_MASTER("Community Master", "Reached 100% community score", "Crown", 100),
    SKILL_COLLECTOR("Skill Collector", "Added 5 skills to your profile", "Target", 5),
    SOCIAL_BUTTERFLY("Social Butterfly", "Connected all social media accounts", "Share2", 4),
    POPULAR_TEACHER("Popular Teacher", "Had 50 students enroll in your classes", "Users", 50),
    TOP_RATED("Highly Rated", "Received 10 class ratings", "ThumbsUp", 10);

    private final String name;
    private final String description;
    private final String icon;
    private final int requiredCount;

    AchievementType(String name, String description, String icon, int requiredCount) {
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.requiredCount = requiredCount;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getIcon() {
        return icon;
    }

    public int getRequiredCount() {
        return requiredCount;
    }
}