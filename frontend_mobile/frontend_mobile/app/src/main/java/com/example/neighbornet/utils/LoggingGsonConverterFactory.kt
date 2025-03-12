package com.example.neighbornet.utils

import android.util.Log
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import okhttp3.RequestBody
import okhttp3.ResponseBody
import retrofit2.Converter
import retrofit2.Retrofit
import java.lang.reflect.Type

class LoggingGsonConverterFactory private constructor(private val gson: Gson) : Converter.Factory() {

    companion object {
        fun create(gson: Gson): LoggingGsonConverterFactory {
            return LoggingGsonConverterFactory(gson)
        }
    }

    override fun responseBodyConverter(
        type: Type,
        annotations: Array<out Annotation>,
        retrofit: Retrofit
    ): Converter<ResponseBody, *> {
        val delegate = gson.getAdapter(TypeToken.get(type))
        return Converter<ResponseBody, Any> { value ->
            val jsonString = value.string()
            Log.d("Retrofit", "Raw response for type $type: $jsonString")
            try {
                delegate.fromJson(jsonString)
            } catch (e: Exception) {
                Log.e("Retrofit", "Error parsing response for type $type", e)
                throw e
            }
        }
    }

    override fun requestBodyConverter(
        type: Type,
        parameterAnnotations: Array<out Annotation>,
        methodAnnotations: Array<out Annotation>,
        retrofit: Retrofit
    ): Converter<*, RequestBody> {
        return retrofit2.converter.gson.GsonConverterFactory.create(gson)
            .requestBodyConverter(type, parameterAnnotations, methodAnnotations, retrofit)!!
    }
}