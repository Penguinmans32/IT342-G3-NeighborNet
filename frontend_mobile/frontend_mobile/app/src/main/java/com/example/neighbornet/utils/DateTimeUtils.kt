package com.example.neighbornet.utils

import android.util.Log
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

fun String.toLocalDate(): LocalDate {
    return LocalDateTime.parse(this).toLocalDate()
}

fun String.formatToTime(): String {
    return try {
        val dateTime = LocalDateTime.parse(this)
        dateTime.format(DateTimeFormatter.ofPattern("h:mm a"))
    } catch (e: Exception) {
        "Invalid time"
    }
}

object DateTimeUtils {
    private val SINGAPORE_ZONE = ZoneId.of("Asia/Singapore")
    private val UTC_ZONE = ZoneId.of("UTC")
    private val ISO_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS")

    fun getCurrentTimestamp(): String {
        return ZonedDateTime.now(UTC_ZONE)
            .format(ISO_FORMATTER)
    }

    fun formatToTime(timestamp: String): String {
        return try {
            val instant = when {
                timestamp.endsWith("Z") -> Instant.parse(timestamp)
                timestamp.contains("+") -> Instant.from(DateTimeFormatter.ISO_OFFSET_DATE_TIME.parse(timestamp))
                else -> LocalDateTime.parse(timestamp, ISO_FORMATTER)
                    .atZone(UTC_ZONE)
                    .toInstant()
            }

            instant.atZone(SINGAPORE_ZONE)
                .format(DateTimeFormatter.ofPattern("h:mm a"))
        } catch (e: Exception) {
            Log.e("DateTimeUtils", "Error formatting time: $timestamp", e)
            "Invalid Time"
        }
    }
}