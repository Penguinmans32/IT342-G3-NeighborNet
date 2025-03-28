package com.example.neighbornet.api

import com.example.neighbornet.network.BorrowRequest
import com.example.neighbornet.network.BorrowingItem
import com.example.neighbornet.network.ItemRating
import com.example.neighbornet.network.RateRequestItem
import com.example.neighbornet.network.RatingRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface BorrowingApiService {
    @GET("api/borrowing/items")
    suspend fun getAllItems(): Response<List<BorrowingItem>>

    @GET("api/borrowing/items/{id}")
    suspend fun getItemById(@Path("id") id: String): Response<BorrowingItem>

    @GET("api/borrowing/items/{id}/rating")
    suspend fun getItemRating(@Path("id") id: String): Response<Float>

    @POST("api/borrowing/items/{id}/rate")
    suspend fun rateItem(
        @Path("id") id: String,
        @Body rating: Float
    ): Response<Unit>

    @GET("api/borrowing/items/all-borrowed")
    suspend fun getAllBorrowedItems(): Response<List<BorrowingItem>>

    @POST("api/borrowing/items/{itemId}/rate")
    suspend fun rateItem(
        @Path("itemId") itemId: String,
        @Body request: RateRequestItem
    ): Response<ItemRating>


    @POST("api/borrowing/requests")
    suspend fun createBorrowRequest(
        @Body request: BorrowRequest
    ): Response<BorrowRequest>

    @POST("api/borrowing/items/{itemId}/rate")
    suspend fun rateItem(
        @Path("itemId") itemId: Long,
        @Body request: RatingRequest
    ): Response<ItemRating>

    @GET("api/borrowing/items/{itemId}/rating")
    suspend fun getItemRating(@Path("itemId") itemId: Long): Response<Float>

    @POST("api/borrowing/items/{itemId}/messages")
    suspend fun sendMessage(
        @Path("itemId") itemId: Long,
        @Body message: String
    ): Response<Unit>

    @GET("api/borrowing/items/{id}")
    suspend fun getItemById(@Path("id") id: Long): BorrowingItem
}