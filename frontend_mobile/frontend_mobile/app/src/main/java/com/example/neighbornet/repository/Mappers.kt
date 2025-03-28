package com.example.neighbornet.repository

import com.example.neighbornet.network.Class
import com.example.neighbornet.network.ClassResponse

fun ClassResponse.toClassModel(): Class {
    return Class(
        id = id,
        title = title,
        description = description,
        category = category,
        thumbnailUrl = thumbnailUrl,
        creatorName = creatorName,
        creatorImageUrl = creator?.imageUrl,
        duration = duration,
        sections = sections,
        sectionsCount = sections.size,
        rating = averageRating.toFloat(),
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}