package com.example.neighbornet.repository

import com.example.neighbornet.api.BorrowingApiService
import com.example.neighbornet.network.BorrowingItem
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class BorrowingRepository @Inject constructor(
    private val borrowingApiService: BorrowingApiService
) {
    suspend fun getAllItems(): List<BorrowingItem> {
        val response = borrowingApiService.getAllItems()
        if (response.isSuccessful) {
            return response.body() ?: emptyList()
        } else {
            throw Exception("Failed to fetch items: ${response.message()}")
        }
    }

    suspend fun getBorrowedItems(): List<BorrowingItem> {
        val response = borrowingApiService.getAllBorrowedItems()
        if (response.isSuccessful) {
            return response.body() ?: emptyList()
        } else {
            throw Exception("Failed to fetch borrowed items: ${response.message()}")
        }
    }

    suspend fun rateItem(itemId: String, rating: Float) {
        val response = borrowingApiService.rateItem(itemId, rating)
        if (!response.isSuccessful) {
            throw Exception("Failed to rate item: ${response.message()}")
        }
    }

    suspend fun sendMessage(itemId: Long, message: String) {
        val response = borrowingApiService.sendMessage(itemId, message)
        if (!response.isSuccessful) {
            throw Exception("Failed to send message: ${response.message()}")
        }
    }

    suspend fun getItemById(itemId: Long): BorrowingItem {
        return borrowingApiService.getItemById(itemId)
    }
}