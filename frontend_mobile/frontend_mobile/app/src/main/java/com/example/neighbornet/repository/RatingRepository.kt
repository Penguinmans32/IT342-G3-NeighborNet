package com.example.neighbornet.repository

import com.example.neighbornet.api.BorrowingApiService
import com.example.neighbornet.network.ItemRating
import com.example.neighbornet.network.RateRequestItem
import retrofit2.Response
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class RatingRepository @Inject constructor(
    private val borrowingApiService: BorrowingApiService
) {
    suspend fun rateItem(itemId: String, rating: Float): Response<ItemRating> {
        return borrowingApiService.rateItem(
            itemId = itemId,
            request = RateRequestItem(rating = rating)
        )
    }

    suspend fun getItemRating(itemId: String): Response<Float> {
        return borrowingApiService.getItemRating(itemId)
    }
}