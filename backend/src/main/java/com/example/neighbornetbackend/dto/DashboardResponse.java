package com.example.neighbornetbackend.dto;

import java.util.List;

public class DashboardResponse {
    private long totalUsers;
    private long activeClasses;
    private long totalPosts;
    private long totalItems;
    private UserGrowthData userGrowth;
    private List<ActivityData> recentActivity;

    // Default constructor
    public DashboardResponse() {
    }

    // Constructor with all fields
    public DashboardResponse(long totalUsers, long activeClasses, long totalPosts, long totalItems,
                             UserGrowthData userGrowth, List<ActivityData> recentActivity) {
        this.totalUsers = totalUsers;
        this.activeClasses = activeClasses;
        this.totalPosts = totalPosts;
        this.totalItems = totalItems;
        this.userGrowth = userGrowth;
        this.recentActivity = recentActivity;
    }


    // Builder class for DashboardResponse
    public static class DashboardResponseBuilder {
        private long totalUsers;
        private long activeClasses;
        private long totalPosts;
        private long totalItems;
        private UserGrowthData userGrowth;
        private List<ActivityData> recentActivity;

        public DashboardResponseBuilder totalUsers(long totalUsers) {
            this.totalUsers = totalUsers;
            return this;
        }

        public DashboardResponseBuilder activeClasses(long activeClasses) {
            this.activeClasses = activeClasses;
            return this;
        }

        public DashboardResponseBuilder totalPosts(long totalPosts) {
            this.totalPosts = totalPosts;
            return this;
        }

        public DashboardResponseBuilder totalItems(long totalItems) {
            this.totalItems = totalItems;
            return this;
        }

        public DashboardResponseBuilder userGrowth(UserGrowthData userGrowth) {
            this.userGrowth = userGrowth;
            return this;
        }

        public DashboardResponseBuilder recentActivity(List<ActivityData> recentActivity) {
            this.recentActivity = recentActivity;
            return this;
        }

        public DashboardResponse build() {
            return new DashboardResponse(totalUsers, activeClasses, totalPosts, totalItems, userGrowth, recentActivity);
        }
    }

    public static DashboardResponseBuilder builder() {
        return new DashboardResponseBuilder();
    }

    public static class GrowthDataPoint {
        private String label;
        private long value;

        public GrowthDataPoint(String label, long value) {
            this.label = label;
            this.value = value;
        }

        // Getters and setters
        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        public long getValue() { return value; }
        public void setValue(long value) { this.value = value; }
    }

    public static class UserGrowthData {
        private long weeklyGrowth;
        private long monthlyGrowth;
        private long yearlyGrowth;
        private double growthPercentage;

        public UserGrowthData() {
        }

        public UserGrowthData(long weeklyGrowth, long monthlyGrowth, long yearlyGrowth, double growthPercentage) {
            this.weeklyGrowth = weeklyGrowth;
            this.monthlyGrowth = monthlyGrowth;
            this.yearlyGrowth = yearlyGrowth;
            this.growthPercentage = growthPercentage;
        }

        // Builder class for UserGrowthData
        public static class UserGrowthDataBuilder {
            private long weeklyGrowth;
            private long monthlyGrowth;
            private long yearlyGrowth;
            private double growthPercentage;

            public UserGrowthDataBuilder weeklyGrowth(long weeklyGrowth) {
                this.weeklyGrowth = weeklyGrowth;
                return this;
            }

            public UserGrowthDataBuilder monthlyGrowth(long monthlyGrowth) {
                this.monthlyGrowth = monthlyGrowth;
                return this;
            }

            public UserGrowthDataBuilder yearlyGrowth(long yearlyGrowth) {
                this.yearlyGrowth = yearlyGrowth;
                return this;
            }

            public UserGrowthDataBuilder growthPercentage(double growthPercentage) {
                this.growthPercentage = growthPercentage;
                return this;
            }

            public UserGrowthData build() {
                return new UserGrowthData(weeklyGrowth, monthlyGrowth, yearlyGrowth, growthPercentage);
            }
        }

        public static UserGrowthDataBuilder builder() {
            return new UserGrowthDataBuilder();
        }

        // Getters and setters
        public long getWeeklyGrowth() {
            return weeklyGrowth;
        }

        public void setWeeklyGrowth(long weeklyGrowth) {
            this.weeklyGrowth = weeklyGrowth;
        }

        public long getMonthlyGrowth() {
            return monthlyGrowth;
        }

        public void setMonthlyGrowth(long monthlyGrowth) {
            this.monthlyGrowth = monthlyGrowth;
        }

        public long getYearlyGrowth() {
            return yearlyGrowth;
        }

        public void setYearlyGrowth(long yearlyGrowth) {
            this.yearlyGrowth = yearlyGrowth;
        }

        public double getGrowthPercentage() {
            return growthPercentage;
        }

        public void setGrowthPercentage(double growthPercentage) {
            this.growthPercentage = growthPercentage;
        }
    }

    public static class ActivityData {
        private String type;
        private String title;
        private String time;
        private String userAvatar;

        public ActivityData() {
        }

        public ActivityData(String type, String title, String time, String userAvatar) {
            this.type = type;
            this.title = title;
            this.time = time;
            this.userAvatar = userAvatar;
        }

        // Builder class for ActivityData
        public static class ActivityDataBuilder {
            private String type;
            private String title;
            private String time;
            private String userAvatar;

            public ActivityDataBuilder type(String type) {
                this.type = type;
                return this;
            }

            public ActivityDataBuilder title(String title) {
                this.title = title;
                return this;
            }

            public ActivityDataBuilder time(String time) {
                this.time = time;
                return this;
            }

            public ActivityDataBuilder userAvatar(String userAvatar) {
                this.userAvatar = userAvatar;
                return this;
            }

            public ActivityData build() {
                return new ActivityData(type, title, time, userAvatar);
            }
        }

        public static ActivityDataBuilder builder() {
            return new ActivityDataBuilder();
        }

        // Getters and setters
        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getTime() {
            return time;
        }

        public void setTime(String time) {
            this.time = time;
        }

        public String getUserAvatar() {
            return userAvatar;
        }

        public void setUserAvatar(String userAvatar) {
            this.userAvatar = userAvatar;
        }
    }

    // Getters and setters for DashboardResponse
    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getActiveClasses() {
        return activeClasses;
    }

    public void setActiveClasses(long activeClasses) {
        this.activeClasses = activeClasses;
    }

    public long getTotalPosts() {
        return totalPosts;
    }

    public void setTotalPosts(long totalPosts) {
        this.totalPosts = totalPosts;
    }

    public long getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(long totalItems) {
        this.totalItems = totalItems;
    }

    public UserGrowthData getUserGrowth() {
        return userGrowth;
    }

    public void setUserGrowth(UserGrowthData userGrowth) {
        this.userGrowth = userGrowth;
    }

    public List<ActivityData> getRecentActivity() {
        return recentActivity;
    }

    public void setRecentActivity(List<ActivityData> recentActivity) {
        this.recentActivity = recentActivity;
    }
}