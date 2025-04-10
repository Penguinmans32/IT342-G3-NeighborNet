package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.RoomCodes;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomCodesRepository extends JpaRepository<RoomCodes, Long> {
    RoomCodes findByRoomId(Long roomId);
}