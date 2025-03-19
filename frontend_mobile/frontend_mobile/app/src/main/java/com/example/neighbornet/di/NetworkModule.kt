package com.example.neighbornet.di

import android.content.Context
import coil.ImageLoader
import com.example.neighbornet.api.ClassApiService
import com.example.neighbornet.auth.TokenManager
import com.example.neighbornet.network.AuthInterceptor
import com.example.neighbornet.network.AuthService
import com.example.neighbornet.utils.ArrayDate
import com.example.neighbornet.utils.ArrayDateAdapter
import com.example.neighbornet.utils.LoggingGsonConverterFactory
import com.example.neighbornet.utils.StringDate
import com.example.neighbornet.utils.StringDateAdapter
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import com.google.gson.reflect.TypeToken
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.scalars.ScalarsConverterFactory
import java.lang.reflect.Type
import java.time.LocalDateTime
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideTokenManager(@ApplicationContext context: Context): TokenManager {
        return TokenManager(context)
    }

    @Provides
    @Singleton
    fun provideAuthInterceptor(tokenManager: TokenManager): AuthInterceptor {
        return AuthInterceptor(tokenManager)
    }

    @Provides
    @Singleton
    fun provideLoggingInterceptor(): HttpLoggingInterceptor {
        return HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
    }

    @Provides
    @Singleton
    fun provideOkHttpClient(
        loggingInterceptor: HttpLoggingInterceptor,
        authInterceptor: AuthInterceptor
    ): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(loggingInterceptor)
            .addInterceptor { chain ->
                val original = chain.request()
                val request = original.newBuilder()
                    .header("X-Mobile-Request", "true")
                    .header("Accept", "application/json")
                    .header("Content-Type", "application/json")
                    .build()
                chain.proceed(request)
            }
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient, gson: Gson): Retrofit {
        return Retrofit.Builder()
            .baseUrl("http://10.0.191.212:8080/")
            .client(okHttpClient)
            .addConverterFactory(ScalarsConverterFactory.create())
            .addConverterFactory(LoggingGsonConverterFactory.create(gson))
            .build()
    }

    @Provides
    @Singleton
    fun provideGson(): Gson {
        return GsonBuilder()
            .registerTypeAdapter(ArrayDate::class.java, ArrayDateAdapter())
            .registerTypeAdapter(StringDate::class.java, StringDateAdapter())
            // Add this general type adapter for any List<Int> that might be dates
            .registerTypeAdapter(object : TypeToken<List<Int>>() {}.type, object :
                JsonDeserializer<List<Int>> {
                override fun deserialize(json: JsonElement, typeOfT: Type, context: JsonDeserializationContext): List<Int> {
                    return when {
                        json.isJsonArray -> json.asJsonArray.map { it.asInt }
                        json.isJsonPrimitive -> {
                            try {
                                val dt = LocalDateTime.parse(json.asString)
                                listOf(dt.year, dt.monthValue, dt.dayOfMonth, dt.hour, dt.minute, dt.second, dt.nano)
                            } catch (e: Exception) {
                                emptyList()
                            }
                        }
                        else -> emptyList()
                    }
                }
            })
            .setDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS")
            .setLenient()
            .create()
    }

    @Provides
    @Singleton
    fun provideClassApiService(retrofit: Retrofit): ClassApiService {
        return retrofit.create(ClassApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideImageLoader(
        @ApplicationContext context: Context,
        okHttpClient: OkHttpClient
    ): ImageLoader {
        return ImageLoader.Builder(context)
            .okHttpClient(okHttpClient)
            .crossfade(true)
            .build()
    }

    @Provides
    @Singleton
    fun provideAuthService(retrofit: Retrofit): AuthService {
        return retrofit.create(AuthService::class.java)
    }
}