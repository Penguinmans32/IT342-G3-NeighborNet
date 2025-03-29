package com.example.neighbornet

import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import android.util.Log
import androidx.media3.common.PlaybackException
import androidx.media3.exoplayer.source.DefaultMediaSourceFactory
import androidx.media3.datasource.DefaultHttpDataSource

@Composable
fun VideoPlayer(
    videoUrl: String,
    classId: Long,
    onProgressUpdate: (Float) -> Unit,
    onCompletion: () -> Unit
) {
    val context = LocalContext.current

    // Add logging
    val filename = videoUrl.substringAfterLast("/")
    val fullVideoUrl = "http://192.168.1.4:8080/api/classes/$classId/lessons/video/$filename"

    Log.d("VideoPlayer", "Original videoUrl: $videoUrl")
    Log.d("VideoPlayer", "Constructed fullVideoUrl: $fullVideoUrl")

    val exoPlayer = remember {
        ExoPlayer.Builder(context)
            .setMediaSourceFactory(
                DefaultMediaSourceFactory(context)
                    .setDataSourceFactory(
                        DefaultHttpDataSource.Factory()
                            .setUserAgent("NeighborNet-Android")
                            .setAllowCrossProtocolRedirects(true)
                    )
            )
            .build()
            .apply {
                setMediaItem(MediaItem.fromUri(fullVideoUrl))
                prepare()
            }
    }

    // Add error handling
    LaunchedEffect(exoPlayer) {
        exoPlayer.addListener(object : Player.Listener {
            override fun onPlayerError(error: PlaybackException) {
                Log.e("VideoPlayer", "Error playing video: ${error.message}")
                error.cause?.printStackTrace()
            }

            override fun onPlaybackStateChanged(playbackState: Int) {
                when (playbackState) {
                    Player.STATE_READY -> Log.d("VideoPlayer", "Player is ready")
                    Player.STATE_BUFFERING -> Log.d("VideoPlayer", "Player is buffering")
                    Player.STATE_ENDED -> {
                        Log.d("VideoPlayer", "Playback ended")
                        onCompletion()
                    }
                    Player.STATE_IDLE -> Log.d("VideoPlayer", "Player is idle")
                }
            }
        })
    }

    DisposableEffect(Unit) {
        onDispose {
            exoPlayer.release()
        }
    }

    AndroidView(
        factory = { context ->
            PlayerView(context).apply {
                player = exoPlayer
                useController = true // Show default controls
                setShowBuffering(PlayerView.SHOW_BUFFERING_ALWAYS)
            }
        },
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(16f / 9f)
    )
}