package com.example.neighbornet.network

import com.google.gson.Gson
import kotlinx.coroutines.flow.MutableStateFlow

fun Message.toJson(): String {
    return Gson().toJson(this)
}

fun String.toMessage(): Message {
    return Gson().fromJson(this, Message::class.java)
}

fun <T> MutableStateFlow<T>.update(function: (T) -> T) {
    value = function(value)
}