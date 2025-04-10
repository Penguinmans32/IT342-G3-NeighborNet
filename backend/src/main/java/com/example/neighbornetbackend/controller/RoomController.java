package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.dto.CreateRoomRequest;
import com.example.neighbornetbackend.dto.RoomResponse;
import com.example.neighbornetbackend.model.Room;
import com.example.neighbornetbackend.service.RoomService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "http://localhost:5173")
public class RoomController {
    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(
            @RequestBody CreateRoomRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        RoomResponse room = roomService.createRoom(request, userDetails.getUsername());
        return ResponseEntity.ok(room);
    }

    @GetMapping
    public ResponseEntity<List<RoomResponse>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<RoomResponse> getRoomDetails(@PathVariable Long roomId) {
        return ResponseEntity.ok(roomService.getRoomDetails(roomId));
    }

    @GetMapping("/{roomId}/token")
    public ResponseEntity<Map<String, String>> getToken(
            @PathVariable Long roomId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            Room room = roomService.getRoomById(roomId);

            String role = determineUserRole(room, userDetails.getUsername());

            Thread.sleep(1000);

            String token = roomService.generateToken(room.getHmsRoomId(), userDetails.getUsername(), role);

            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "role", role,
                    "userId", userDetails.getUsername(),
                    "roomId", room.getHmsRoomId()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to generate token: " + e.getMessage()));
        }
    }

    private String determineUserRole(Room room, String username) {
        if (room.getCreatorId().equals(username)) {
            return "moderator";
        }
        return "listener";
    }
}