package com.example.neighbornet.utils

object UrlUtils {
    private const val BASE_URL = "http://10.0.191.212:8080"
    private const val LOCALHOST = "http://localhost:8080"

    fun getFullImageUrl(url: String?): String {
        if (url == null || url.isEmpty()) {
            return "$BASE_URL/images/defaultProfile.png"
        }

        return if (url.startsWith("http")) {
            url.replace(LOCALHOST, BASE_URL)
        } else {
            "$BASE_URL$url"
        }
    }

    fun getFullThumbnailUrl(url: String?): String {
        if (url == null || url.isEmpty()) {
            return "$BASE_URL/default-class-image.jpg"
        }

        return if (url.startsWith("http")) {
            url.replace(LOCALHOST, BASE_URL)
        } else {
            "$BASE_URL$url"
        }
    }
}