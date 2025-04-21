package com.example.neighbornet.network

data class PaginatedClassResponse(
    val classes: List<ClassResponse>,
    val currentPage: Int,
    val totalItems: Int,
    val totalPages: Int,
    val size: Int
)