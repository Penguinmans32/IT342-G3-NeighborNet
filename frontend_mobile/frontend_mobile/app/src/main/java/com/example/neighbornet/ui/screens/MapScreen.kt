package com.example.neighbornet.ui.screens

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationManager
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
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
import org.osmdroid.tileprovider.tilesource.XYTileSource
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Marker
import org.osmdroid.views.overlay.MapEventsOverlay
import org.osmdroid.views.overlay.Polyline
import org.osmdroid.views.overlay.compass.CompassOverlay
import org.osmdroid.views.overlay.mylocation.GpsMyLocationProvider
import org.osmdroid.views.overlay.mylocation.MyLocationNewOverlay
import kotlin.math.*
import java.io.File

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

private fun drawRoute(
    mapView: MapView?,
    start: GeoPoint,
    end: GeoPoint,
    routeLine: Polyline?,
    color: Int
): Polyline? {
    routeLine?.let { mapView?.overlays?.remove(it) }
    
    val line = Polyline(mapView).apply {
        outlinePaint.color = color
        outlinePaint.strokeWidth = 5f
        setPoints(arrayListOf(start, end))
    }
    
    mapView?.overlays?.add(line)
    mapView?.invalidate()
    return line
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
    var mapView: MapView? by remember { mutableStateOf(null) }
    var hasLocationPermission by remember { mutableStateOf(false) }
    var myLocationOverlay by remember { mutableStateOf<MyLocationNewOverlay?>(null) }
    var searchQuery by remember { mutableStateOf("") }
    var markers by remember { mutableStateOf(mutableListOf<Marker>()) }
    var routeLine by remember { mutableStateOf<Polyline?>(null) }
    var distanceText by remember { mutableStateOf<String?>(null) }
    var showRemoveConfirmation by remember { mutableStateOf(false) }
    var markerToRemove by remember { mutableStateOf<Marker?>(null) }
    var isFollowingLocation by remember { mutableStateOf(false) }

    // Get the primary color for the route line
    val primaryColor = MaterialTheme.colorScheme.primary.hashCode()

    // Initialize OpenStreetMap configuration
    LaunchedEffect(Unit) {
        val osmConfig = Configuration.getInstance()
        osmConfig.load(context, context.getSharedPreferences("osm_prefs", Context.MODE_PRIVATE))
        osmConfig.userAgentValue = context.packageName
        val basePath = File(context.cacheDir.absolutePath, "osmdroid")
        osmConfig.osmdroidBasePath = basePath
        val tileCache = File(osmConfig.osmdroidBasePath.absolutePath, "tile")
        osmConfig.osmdroidTileCache = tileCache
    }

    // Request location permission
    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasLocationPermission = isGranted
        if (!isGranted) {
            Toast.makeText(context, "Location permission is required for full functionality", Toast.LENGTH_SHORT).show()
        }
    }

    // Check if we have location permission
    LaunchedEffect(Unit) {
        hasLocationPermission = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED

        if (!hasLocationPermission) {
            permissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
        }
    }

    // Confirmation dialog for removing marker
    if (showRemoveConfirmation) {
        AlertDialog(
            onDismissRequest = { showRemoveConfirmation = false },
            title = { Text("Remove Marker") },
            text = { Text("Do you want to remove this marker?") },
            confirmButton = {
                TextButton(
                    onClick = {
                        markerToRemove?.let { removeMarker(mapView, it, markers, routeLine) }
                        showRemoveConfirmation = false
                        markerToRemove = null
                    }
                ) {
                    Text("Remove")
                }
            },
            dismissButton = {
                TextButton(
                    onClick = {
                        showRemoveConfirmation = false
                        markerToRemove = null
                    }
                ) {
                    Text("Cancel")
                }
            }
        )
    }

    Box(modifier = Modifier.fillMaxSize()) {
        // Map view in the background
        AndroidView(
            factory = { ctx ->
                MapView(ctx).apply {
                    mapView = this
                    setTileSource(TileSourceFactory.MAPNIK)
                    setMultiTouchControls(true)
                    controller.setZoom(15.0)

                    // Set default location (Cebu City)
                    val cebuCity = GeoPoint(10.3157, 123.8854)
                    controller.setCenter(cebuCity)

                    // Add the default marker for Cebu City
                    val defaultMarker = Marker(this).apply {
                        position = cebuCity
                        title = "Your Location"
                        setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
                        icon = ContextCompat.getDrawable(ctx, org.osmdroid.library.R.drawable.person)
                    }
                    overlays.add(defaultMarker)

                    // Add map events overlay for handling taps and long presses
                    val mapEventsOverlay = MapEventsOverlay(object : MapEventsReceiver {
                        override fun singleTapConfirmedHelper(p: GeoPoint?): Boolean {
                            return true
                        }

                        override fun longPressHelper(p: GeoPoint?): Boolean {
                            p?.let { point ->
                                val newMarker = Marker(this@apply).apply {
                                    position = point
                                    title = "Selected Location"
                                    setOnMarkerClickListener { marker, _ ->
                                        markerToRemove = marker
                                        showRemoveConfirmation = true
                                        true
                                    }
                                    setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
                                    // Set marker color to red
                                    icon = ContextCompat.getDrawable(ctx, org.osmdroid.library.R.drawable.marker_default)
                                    setInfoWindow(null)
                                }
                                
                                // Calculate distance from Cebu City marker
                                val distance = calculateDistance(cebuCity, point)
                                distanceText = "Distance: %.2f km".format(distance)
                                newMarker.snippet = distanceText
                                routeLine = drawRoute(this@apply, cebuCity, point, routeLine, primaryColor)

                                overlays.add(newMarker)
                                markers.add(newMarker)
                                invalidate()
                            }
                            return true
                        }
                    })
                    overlays.add(mapEventsOverlay)
                }
            },
            modifier = Modifier.fillMaxSize()
        )

        // Overlay content on top of map
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .zIndex(1f)
        ) {
            // Title with semi-transparent background
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = MaterialTheme.colorScheme.surface.copy(alpha = 0.9f),
                tonalElevation = 8.dp
            ) {
                Text(
                    text = "Connect with your Community",
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center,
                    color = MaterialTheme.colorScheme.primary
                )
            }

            // Search bar with elevation and background
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                shape = RoundedCornerShape(28.dp),
                tonalElevation = 8.dp,
                shadowElevation = 4.dp
            ) {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    modifier = Modifier.fillMaxWidth(),
                    placeholder = { Text("Search places...") },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search") },
                    trailingIcon = if (searchQuery.isNotEmpty()) {
                        {
                            IconButton(onClick = { searchQuery = "" }) {
                                Icon(Icons.Default.Clear, "Clear search")
                            }
                        }
                    } else null,
                    singleLine = true,
                    shape = RoundedCornerShape(28.dp),
                    colors = TextFieldDefaults.outlinedTextFieldColors(
                        containerColor = MaterialTheme.colorScheme.surface,
                        unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)
                    )
                )
            }

            // Distance text if available
            distanceText?.let { distance ->
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    color = MaterialTheme.colorScheme.surface.copy(alpha = 0.9f),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = distance,
                        modifier = Modifier.padding(8.dp),
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            }
        }

        // Button column at bottom-end
        Column(
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(16.dp)
                .zIndex(1f),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Remove All Markers button (only show if there are markers)
            if (markers.isNotEmpty()) {
                FloatingActionButton(
                    onClick = { removeAllMarkers(mapView, markers, routeLine) },
                    containerColor = MaterialTheme.colorScheme.errorContainer,
                    shape = CircleShape
                ) {
                    Icon(
                        Icons.Default.Delete,
                        contentDescription = "Remove All Markers",
                        tint = MaterialTheme.colorScheme.onErrorContainer
                    )
                }
            }

            // My Location Button
            if (hasLocationPermission) {
                FloatingActionButton(
                    onClick = {
                        myLocationOverlay?.let { overlay ->
                            if (overlay.myLocation != null) {
                                mapView?.controller?.animateTo(overlay.myLocation)
                                mapView?.controller?.setZoom(18.0)
                                isFollowingLocation = !isFollowingLocation
                                if (isFollowingLocation) {
                                    overlay.enableFollowLocation()
                                } else {
                                    overlay.disableFollowLocation()
                                }
                            } else {
                                Toast.makeText(context, "Getting location...", Toast.LENGTH_SHORT).show()
                            }
                        }
                    },
                    shape = CircleShape,
                    containerColor = if (isFollowingLocation) 
                        MaterialTheme.colorScheme.primary 
                    else 
                        MaterialTheme.colorScheme.surface
                ) {
                    Icon(
                        Icons.Default.MyLocation,
                        contentDescription = "My Location",
                        tint = if (isFollowingLocation)
                            MaterialTheme.colorScheme.onPrimary
                        else
                            MaterialTheme.colorScheme.onSurface
                    )
                }
            }
        }
    }

    // Handle map lifecycle
    DisposableEffect(Unit) {
        onDispose {
            mapView?.onDetach()
            mapView = null
        }
    }
} 