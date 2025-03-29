package com.example.neighbornet.ui.screens

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationManager
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.zIndex
import androidx.core.content.ContextCompat
import org.osmdroid.config.Configuration
import org.osmdroid.events.MapEventsReceiver
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Marker
import org.osmdroid.views.overlay.MapEventsOverlay
import org.osmdroid.views.overlay.Polyline
import org.osmdroid.views.overlay.compass.CompassOverlay
import org.osmdroid.views.overlay.mylocation.GpsMyLocationProvider
import org.osmdroid.views.overlay.mylocation.MyLocationNewOverlay
import kotlin.math.*
import kotlinx.coroutines.launch
import java.net.URL
import org.json.JSONObject
import org.osmdroid.util.BoundingBox
import org.osmdroid.util.Distance
import kotlinx.coroutines.Dispatchers
import android.util.Log
import kotlinx.coroutines.withContext

// Helper functions moved outside the composable
private fun calculateDistance(point1: GeoPoint, point2: GeoPoint): Double {
    val R = 6371 // Earth's radius in kilometers
    val lat1 = point1.latitude * Math.PI / 180
    val lat2 = point2.latitude * Math.PI / 180
    val dLat = (point2.latitude - point1.latitude) * Math.PI / 180
    val dLon = (point2.longitude - point1.longitude) * Math.PI / 180

    val a = sin(dLat / 2) * sin(dLat / 2) +
            cos(lat1) * cos(lat2) *
            sin(dLon / 2) * sin(dLon / 2)
    val c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c
}

private suspend fun getRoutePoints(
    context: Context,
    start: GeoPoint,
    end: GeoPoint,
    onDistanceUpdated: (Double) -> Unit
): List<GeoPoint> {
    return try {
        val url = "https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=polyline6"
        val response = withContext(Dispatchers.IO) {
            URL(url).openConnection().apply {
                connectTimeout = 5000
                readTimeout = 5000
                setRequestProperty("User-Agent", "NeighborNet-App")
            }.getInputStream().bufferedReader().readText()
        }
        
        Log.d("MapScreen", "Route response: $response")
        
        val json = JSONObject(response)
        val routes = json.getJSONArray("routes")
        if (routes.length() > 0) {
            val route = routes.getJSONObject(0)
            val geometry = route.getString("geometry")
            val distance = route.getDouble("distance") / 1000 // Convert to km
            
            // Update distance using callback
            onDistanceUpdated(distance)
            
            decodePolyline(geometry)
        } else {
            Log.e("MapScreen", "No routes found in response")
            listOf(start, end)
        }
    } catch (e: Exception) {
        Log.e("MapScreen", "Error getting route: ${e.message}", e)
        withContext(Dispatchers.Main) {
            Toast.makeText(context, "Could not get route, showing direct line", Toast.LENGTH_SHORT).show()
        }
        listOf(start, end)
    }
}

private fun decodePolyline(encoded: String): List<GeoPoint> {
    val points = mutableListOf<GeoPoint>()
    var index = 0
    var lat = 0
    var lng = 0

    try {
        while (index < encoded.length) {
            var b: Int
            var shift = 0
            var result = 0
            do {
                b = encoded[index++].toInt() - 63
                result = result or (b and 0x1f shl shift)
                shift += 5
            } while (b >= 0x20)
            val dlat = if (result and 1 != 0) -(result shr 1) else result shr 1
            lat += dlat

            shift = 0
            result = 0
            do {
                b = encoded[index++].toInt() - 63
                result = result or (b and 0x1f shl shift)
                shift += 5
            } while (b >= 0x20)
            val dlng = if (result and 1 != 0) -(result shr 1) else result shr 1
            lng += dlng

            val finalLat = lat * 1e-6
            val finalLng = lng * 1e-6
            points.add(GeoPoint(finalLat, finalLng))
        }
    } catch (e: Exception) {
        Log.e("MapScreen", "Error decoding polyline: ${e.message}", e)
    }

    return if (points.isEmpty()) {
        Log.e("MapScreen", "No points decoded from polyline")
        emptyList()
    } else {
        points
    }
}

private suspend fun drawRoute(
    context: Context,
    mapView: MapView?,
    start: GeoPoint,
    end: GeoPoint,
    existingLine: Polyline?,
    color: Int,
    onDistanceUpdated: (Double) -> Unit
): Polyline {
    existingLine?.let { mapView?.overlays?.remove(it) }
    
    val routePoints = getRoutePoints(context, start, end, onDistanceUpdated)
    
    return Polyline(mapView).apply {
        outlinePaint.color = color
        outlinePaint.strokeWidth = 5f
        
        if (routePoints.size > 1) {
            setPoints(routePoints)
        } else {
            // Fallback to straight line if no route points
            setPoints(arrayListOf(start, end))
        }
        
        mapView?.overlays?.add(this)
        
        // Only zoom to bounding box if we have actual route points
        if (routePoints.size > 2) {
            val boundingBox = BoundingBox.fromGeoPoints(routePoints)
            mapView?.zoomToBoundingBox(boundingBox, true, 100)
        }
        
        mapView?.invalidate()
    }
}

private fun removeMarker(
    mapView: MapView?,
    marker: Marker,
    markers: MutableList<Marker>,
    routeLine: Polyline?
) {
    mapView?.overlays?.remove(marker)
    markers.remove(marker)
    routeLine?.let { mapView?.overlays?.remove(it) }
    mapView?.invalidate()
}

private fun removeAllMarkers(
    mapView: MapView?,
    markers: MutableList<Marker>,
    routeLine: Polyline?
) {
    markers.forEach { marker ->
        mapView?.overlays?.remove(marker)
    }
    markers.clear()
    routeLine?.let { mapView?.overlays?.remove(it) }
    mapView?.invalidate()
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MapScreen() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var mapView: MapView? by remember { mutableStateOf(null) }
    var markers = remember { mutableStateListOf<Marker>() }
    var routeLine by remember { mutableStateOf<Polyline?>(null) }
    var distanceText by remember { mutableStateOf("") }
    var showRemoveConfirmation by remember { mutableStateOf(false) }
    var markerToRemove by remember { mutableStateOf<Marker?>(null) }
    var userLocationMarker by remember { mutableStateOf<Marker?>(null) }
    var destinationMarker by remember { mutableStateOf<Marker?>(null) }
    var isSelectingLocation by remember { mutableStateOf(false) }
    var isSelectingDestination by remember { mutableStateOf(false) }
    var showInstructions by remember { mutableStateOf(false) }

    // Initialize OpenStreetMap configuration
    LaunchedEffect(Unit) {
        Configuration.getInstance().apply {
            load(context, context.getSharedPreferences("osm_prefs", Context.MODE_PRIVATE))
            userAgentValue = context.packageName
            osmdroidTileCache = context.cacheDir
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        // Map view
        AndroidView(
            factory = { ctx ->
                MapView(ctx).apply {
                    mapView = this
                    setTileSource(TileSourceFactory.MAPNIK)
                    setUseDataConnection(true)  // Enable downloading tiles
                    setMultiTouchControls(true)
                    setBuiltInZoomControls(true)
                    
                    // Set initial position (Philippines)
                    controller.setZoom(7.0)  // Zoom out to see more of the map
                    controller.setCenter(GeoPoint(12.8797, 121.7740))

                    // Add map events overlay for handling taps
                    val mapEventsOverlay = MapEventsOverlay(object : MapEventsReceiver {
                        override fun singleTapConfirmedHelper(p: GeoPoint?): Boolean {
                            if (isSelectingLocation) {
                                p?.let { point ->
                                    userLocationMarker?.let { overlays.remove(it) }
                                    val newMarker = Marker(this@apply).apply {
                                        position = point
                                        title = "Your Location"
                                        setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
                                        icon = ContextCompat.getDrawable(ctx, org.osmdroid.library.R.drawable.person)
                                    }
                                    userLocationMarker = newMarker
                                    overlays.add(newMarker)
                                    controller.animateTo(point)  // Center on the new marker
                                    
                                    destinationMarker?.let { destMarker ->
                                        scope.launch {
                                            routeLine = drawRoute(
                                                context = context,
                                                mapView = this@apply,
                                                start = point,
                                                end = destMarker.position,
                                                existingLine = routeLine,
                                                color = Color.Blue.hashCode(),
                                                onDistanceUpdated = { distance ->
                                                    distanceText = "Distance: %.2f km".format(distance)
                                                }
                                            )
                                        }
                                    }
                                    invalidate()
                                }
                                isSelectingLocation = false
                                showInstructions = false
                                return true
                            }
                            
                            if (isSelectingDestination) {
                                p?.let { point ->
                                    destinationMarker?.let { overlays.remove(it) }
                                    val newMarker = Marker(this@apply).apply {
                                        position = point
                                        title = "Destination"
                                        setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
                                        icon = ContextCompat.getDrawable(ctx, org.osmdroid.library.R.drawable.marker_default)
                                    }
                                    destinationMarker = newMarker
                                    overlays.add(newMarker)
                                    controller.animateTo(point)  // Center on the new marker
                                    
                                    userLocationMarker?.let { locMarker ->
                                        scope.launch {
                                            routeLine = drawRoute(
                                                context = context,
                                                mapView = this@apply,
                                                start = locMarker.position,
                                                end = point,
                                                existingLine = routeLine,
                                                color = Color.Blue.hashCode(),
                                                onDistanceUpdated = { distance ->
                                                    distanceText = "Distance: %.2f km".format(distance)
                                                }
                                            )
                                        }
                                    }
                                    invalidate()
                                }
                                isSelectingDestination = false
                                showInstructions = false
                                return true
                            }
                            return true
                        }

                        override fun longPressHelper(p: GeoPoint?): Boolean = true
                    })
                    overlays.add(mapEventsOverlay)
                }
            },
            modifier = Modifier.fillMaxSize()
        )

        // Header at the top
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 16.dp)
        ) {
            Text(
                text = "Connect with your Community",
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surface.copy(alpha = 0.9f))
                    .padding(16.dp),
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colorScheme.primary
            )

            // Distance text
            if (distanceText.isNotEmpty()) {
                Text(
                    text = distanceText,
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(MaterialTheme.colorScheme.surface.copy(alpha = 0.9f))
                        .padding(8.dp),
                    textAlign = TextAlign.Center
                )
            }
        }

        // Instructions overlay when selecting
        if (showInstructions) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.Black.copy(alpha = 0.7f))
                    .padding(16.dp)
            ) {
                Text(
                    text = if (isSelectingLocation) 
                        "Tap on the map to mark your location" 
                    else 
                        "Tap on the map to mark your destination",
                    color = Color.White,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }

        // Action buttons column
        Column(
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Add Location button
            FloatingActionButton(
                onClick = { 
                    isSelectingLocation = true
                    showInstructions = true
                },
                containerColor = MaterialTheme.colorScheme.primary
            ) {
                Icon(Icons.Default.LocationOn, "Add Your Location")
            }
            
            // Add Destination button
            FloatingActionButton(
                onClick = { 
                    isSelectingDestination = true
                    showInstructions = true
                },
                containerColor = MaterialTheme.colorScheme.secondary
            ) {
                Icon(Icons.Default.Place, "Add Destination")
            }

            // Remove all markers button
            if (userLocationMarker != null || destinationMarker != null) {
                FloatingActionButton(
                    onClick = {
                        userLocationMarker?.let { mapView?.overlays?.remove(it) }
                        destinationMarker?.let { mapView?.overlays?.remove(it) }
                        routeLine?.let { mapView?.overlays?.remove(it) }
                        userLocationMarker = null
                        destinationMarker = null
                        routeLine = null
                        distanceText = ""
                        mapView?.invalidate()
                    },
                    containerColor = MaterialTheme.colorScheme.error
                ) {
                    Icon(Icons.Default.Delete, "Remove All Markers")
                }
            }
        }
    }

    DisposableEffect(Unit) {
        onDispose {
            mapView?.onDetach()
        }
    }
} 