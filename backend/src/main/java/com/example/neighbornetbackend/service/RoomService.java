package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.dto.CreateRoomRequest;
import com.example.neighbornetbackend.dto.RoomResponse;
import com.example.neighbornetbackend.model.Room;
import com.example.neighbornetbackend.model.RoomCodes;
import com.example.neighbornetbackend.repository.RoomCodesRepository;
import com.example.neighbornetbackend.repository.RoomRepository;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class RoomService {
    private final HmsWebClientService hmsService;
    private final RoomRepository roomRepository;
    private final RoomCodesRepository roomCodesRepository;


    private static final Logger logger = LoggerFactory.getLogger(RoomService.class);

    public RoomService(HmsWebClientService hmsService, RoomRepository roomRepository, RoomCodesRepository roomCodesRepository) {
        this.hmsService = hmsService;
        this.roomRepository = roomRepository;
        this.roomCodesRepository = roomCodesRepository;
    }

    public RoomResponse createRoom(CreateRoomRequest request, String userId) {
        try {
            // Create room in 100ms
            Map hmsRoom = hmsService.createRoom(request.getName(), request.getDescription())
                    .block();

            String hmsRoomId = hmsRoom.get("id").toString();

            // Generate room codes
            Map speakerCode = hmsService.createRoomCode(hmsRoomId, "speaker").block();
            Map listenerCode = hmsService.createRoomCode(hmsRoomId, "listener").block();
            Map moderatorCode = hmsService.createRoomCode(hmsRoomId, "moderator").block();

            // Save room
            Room room = new Room();
            room.setName(request.getName());
            room.setDescription(request.getDescription());
            room.setHmsRoomId(hmsRoomId);
            room.setCreatorId(userId);
            room.setCreatedAt(LocalDateTime.now());
            room = roomRepository.save(room);

            // Save room codes
            RoomCodes roomCodes = new RoomCodes();
            roomCodes.setRoom(room);
            roomCodes.setSpeakerCode(speakerCode.get("code").toString());
            roomCodes.setListenerCode(listenerCode.get("code").toString());
            roomCodes.setModeratorCode(moderatorCode.get("code").toString());
            roomCodesRepository.save(roomCodes);

            // Create response
            Map<String, String> codes = new HashMap<>();
            codes.put("speaker", roomCodes.getSpeakerCode());
            codes.put("listener", roomCodes.getListenerCode());
            codes.put("moderator", roomCodes.getModeratorCode());

            return RoomResponse.builder()
                    .id(room.getId().toString())
                    .name(room.getName())
                    .description(room.getDescription())
                    .codes(codes)
                    .build();
        } catch (Exception e) {
            logger.error("Error creating room: ", e);
            throw new RuntimeException("Failed to create room", e);
        }
    }

    public String generateToken(String hmsRoomId, String userId, String role) {
        try {
            return hmsService.generateAuthToken(hmsRoomId, userId, role);
        } catch (Exception e) {
            logger.error("Error generating token for room {}: ", hmsRoomId, e);
            throw new RuntimeException("Failed to generate token", e);
        }
    }

    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(room -> {
                    RoomCodes codes = roomCodesRepository.findByRoomId(room.getId());
                    Map<String, String> codesMap = new HashMap<>();
                    if (codes != null) {
                        codesMap.put("speaker", codes.getSpeakerCode());
                        codesMap.put("listener", codes.getListenerCode());
                        codesMap.put("moderator", codes.getModeratorCode());
                    }
                    return RoomResponse.builder()
                            .id(room.getId().toString())
                            .name(room.getName())
                            .description(room.getDescription())
                            .codes(codesMap)
                            .build();
                })
                .collect(Collectors.toList());
    }

    public RoomResponse getRoomDetails(Long roomId) {
        Room room = getRoomById(roomId);
        RoomCodes codes = roomCodesRepository.findByRoomId(roomId);

        Map<String, String> codesMap = new HashMap<>();
        if (codes != null) {
            codesMap.put("speaker", codes.getSpeakerCode());
            codesMap.put("listener", codes.getListenerCode());
            codesMap.put("moderator", codes.getModeratorCode());
        }

        return RoomResponse.builder()
                .id(room.getId().toString())
                .name(room.getName())
                .description(room.getDescription())
                .codes(codesMap)
                .build();
    }

    public Room getRoomById(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));
    }
}