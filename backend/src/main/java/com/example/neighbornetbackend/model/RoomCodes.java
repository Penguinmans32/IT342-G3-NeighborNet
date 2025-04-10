package com.example.neighbornetbackend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "room_codes")
public class RoomCodes {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(nullable = false)
    private String speakerCode;

    @Column(nullable = false)
    private String listenerCode;

    @Column(nullable = false)
    private String moderatorCode;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Room getRoom() {
        return room;
    }

    public void setRoom(Room room) {
        this.room = room;
    }

    public String getSpeakerCode() {
        return speakerCode;
    }

    public void setSpeakerCode(String speakerCode) {
        this.speakerCode = speakerCode;
    }

    public String getListenerCode() {
        return listenerCode;
    }

    public void setListenerCode(String listenerCode) {
        this.listenerCode = listenerCode;
    }

    public String getModeratorCode() {
        return moderatorCode;
    }

    public void setModeratorCode(String moderatorCode) {
        this.moderatorCode = moderatorCode;
    }
}