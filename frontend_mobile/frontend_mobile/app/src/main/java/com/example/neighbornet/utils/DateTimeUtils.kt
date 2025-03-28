package com.example.neighbornet.utils

import java.time.LocalDate
import java.time.LocalDateTime
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