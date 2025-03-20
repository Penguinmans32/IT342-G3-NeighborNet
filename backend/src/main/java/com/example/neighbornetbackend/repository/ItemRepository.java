package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.Item;
import com.example.neighbornetbackend.model.ItemRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByOwnerId(Long userId);
    List<Item> findByCategory(String category);

    @Query(value =
            "SELECT *, " +
                    "(6371 * acos(cos(radians(:latitude)) * cos(radians(i.latitude)) * " +
                    "cos(radians(i.longitude) - radians(:longitude)) + " +
                    "sin(radians(:latitude)) * sin(radians(i.latitude)))) AS distance " +
                    "FROM items i " +
                    "HAVING distance < :radiusInKm " +
                    "ORDER BY distance",
            nativeQuery = true)
    List<Item> findItemsWithinRadius(
            @Param("latitude") double latitude,
            @Param("longitude") double longitude,
            @Param("radiusInKm") double radiusInKm
    );

    @Query("SELECT i FROM Item i WHERE " +
            "i.latitude BETWEEN :minLat AND :maxLat AND " +
            "i.longitude BETWEEN :minLng AND :maxLng")
    List<Item> findItemsWithinBounds(
            @Param("minLat") double minLat,
            @Param("maxLat") double maxLat,
            @Param("minLng") double minLng,
            @Param("maxLng") double maxLng
    );

    int countByOwnerId(Long userId);
}