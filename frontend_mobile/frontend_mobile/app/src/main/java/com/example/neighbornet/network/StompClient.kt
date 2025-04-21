package com.example.neighbornet.network

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import java.util.UUID

class StompClient(
    private val url: String,
    private val okHttpClient: OkHttpClient
) {
    private var webSocket: WebSocket? = null
    private val subscriptions = mutableMapOf<String, StompSubscription>()
    private var isConnected = false
    private var connectCallback: (() -> Unit)? = null
    private var errorCallback: ((Throwable) -> Unit)? = null

    suspend fun connect(
        onConnect: () -> Unit,
        onError: (Throwable) -> Unit
    ) {
        connectCallback = onConnect
        errorCallback = onError

        try {
            withContext(Dispatchers.IO) {
                val wsUrl = url.replace("http://", "ws://").replace("https://", "wss://")

                val request = Request.Builder()
                    .url(wsUrl)
                    .header("Upgrade", "websocket")
                    .header("Connection", "Upgrade")
                    .build()

                webSocket = okHttpClient.newWebSocket(request, createWebSocketListener())
            }
        } catch (e: Exception) {
            errorCallback?.invoke(e)
        }
    }

    private fun createWebSocketListener() = object : WebSocketListener() {
        override fun onOpen(webSocket: WebSocket, response: Response) {
            val connectFrame = StompFrame(
                command = "CONNECT",
                headers = mapOf(
                    "accept-version" to "1.2",
                    "heart-beat" to "0,0"
                )
            )
            webSocket.send(connectFrame.toString())
        }

        override fun onMessage(webSocket: WebSocket, text: String) {
            try {
                val frame = StompFrame.parse(text)
                when (frame.command) {
                    "CONNECTED" -> {
                        isConnected = true
                        connectCallback?.invoke()
                    }
                    "MESSAGE" -> {
                        val subscription = frame.headers["subscription"]
                        subscription?.let { sub ->
                            subscriptions[sub]?.onMessage?.invoke(frame.body)
                        }
                    }
                }
            } catch (e: Exception) {
                errorCallback?.invoke(e)
            }
        }

        override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
            isConnected = false
            errorCallback?.invoke(t)
        }
    }

    fun subscribe(
        destination: String,
        onMessage: (String) -> Unit
    ): StompSubscription {
        val id = UUID.randomUUID().toString()
        val subscribeFrame = StompFrame(
            command = "SUBSCRIBE",
            headers = mapOf(
                "id" to id,
                "destination" to destination
            )
        )
        webSocket?.send(subscribeFrame.toString())

        return StompSubscription(id, destination, onMessage).also {
            subscriptions[id] = it
        }
    }


    fun send(destination: String, message: String) {
        if (!isConnected) return

        val sendFrame = StompFrame(
            command = "SEND",
            headers = mapOf(
                "destination" to destination,
                "content-type" to "application/json"
            ),
            body = message
        )
        webSocket?.send(sendFrame.toString())
    }

    fun disconnect() {
        webSocket?.close(1000, "Bye")
        webSocket = null
        isConnected = false
        subscriptions.clear()
    }
}

data class StompSubscription(
    val id: String,
    val destination: String,
    val onMessage: (String) -> Unit
) {
    fun unsubscribe() {
        // Implementation for unsubscribe
    }
}

data class StompFrame(
    val command: String,
    val headers: Map<String, String> = emptyMap(),
    val body: String = ""
) {
    override fun toString(): String {
        val headerString = headers.entries.joinToString("\n") { "${it.key}:${it.value}" }
        return "$command\n$headerString\n\n$body\u0000"
    }

    companion object {
        fun parse(rawFrame: String): StompFrame {
            val parts = rawFrame.split("\n\n")
            val headerPart = parts[0]
            val body = parts.getOrNull(1)?.removeSuffix("\u0000") ?: ""

            val lines = headerPart.split("\n")
            val command = lines[0]
            val headers = lines.drop(1)
                .filter { it.contains(":") }
                .associate { line ->
                    val (key, value) = line.split(":", limit = 2)
                    key to value
                }

            return StompFrame(command, headers, body)
        }
    }
}