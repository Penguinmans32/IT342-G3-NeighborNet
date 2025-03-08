package com.example.neighbornetbackend.dto;

public class DashboardStatsDTO {

    private long skillsShared;
    private long itemsBorrowed;
    private long activeUsers;
    private StatsChangeDTO changes;

    public DashboardStatsDTO(long skillsShared, long itemsBorrowed,  long activeUsers, StatsChangeDTO changes) {
        this.skillsShared = skillsShared;
        this.itemsBorrowed = itemsBorrowed;
        this.activeUsers = activeUsers;
        this.changes = changes;
    }

    public static class StatsChangeDTO {
        private double skillsSharedChange;
        private double itemsBorrowedChange;
        private double activeUsersChange;

        public StatsChangeDTO(double skillsSharedChange, double itemsBorrowedChange, double activeUsersChange) {
            this.skillsSharedChange = skillsSharedChange;
            this.itemsBorrowedChange = itemsBorrowedChange;
            this.activeUsersChange = activeUsersChange;
        }

        public double getSkillsSharedChange() {
            return skillsSharedChange;
        }

        public void setSkillsSharedChange(double skillsSharedChange) {
            this.skillsSharedChange = skillsSharedChange;
        }

        public double getItemsBorrowedChange() {
            return itemsBorrowedChange;
        }

        public void setItemsBorrowedChange(double itemsBorrowedChange) {
            this.itemsBorrowedChange = itemsBorrowedChange;
        }


        public double getActiveUsersChange() {
            return activeUsersChange;
        }

        public void setActiveUsersChange(double activeUsersChange) {
            this.activeUsersChange = activeUsersChange;
        }
    }



    public long getSkillsShared() {
        return skillsShared;
    }

    public void setSkillsShared(long skillsShared) {
        this.skillsShared = skillsShared;
    }

    public long getItemsBorrowed() {
        return itemsBorrowed;
    }

    public void setItemsBorrowed(long itemsBorrowed) {
        this.itemsBorrowed = itemsBorrowed;
    }


    public long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(long activeUsers) {
        this.activeUsers = activeUsers;
    }
}
