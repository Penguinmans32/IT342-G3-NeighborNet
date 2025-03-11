package com.example.neighbornet.network

import retrofit2.Response

suspend fun <T> Response<ApiResponse<T>>.handleResponse(
    onSuccess: suspend (T) -> Unit,
    onError: suspend (String) -> Unit
) {
    if (isSuccessful) {
        val apiResponse = body()
        if (apiResponse?.success == true && apiResponse.data != null) {
            onSuccess(apiResponse.data)
        } else {
            onError(apiResponse?.message ?: "Unknown error occurred")
        }
    } else {
        onError(errorBody()?.string() ?: "Network request failed")
    }
}