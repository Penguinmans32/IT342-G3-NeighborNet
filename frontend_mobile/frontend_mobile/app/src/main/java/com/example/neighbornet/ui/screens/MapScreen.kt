package com.example.neighbornet.ui.screens


import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.location.Location
import android.view.View
import android.widget.FrameLayout
import android.widget.TextView
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import kotlin.math.*
import kotlinx.coroutines.launch
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.neighbornet.auth.MapViewModel
import com.example.neighbornet.network.BorrowingItem
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.GoogleMap
import com.google.maps.android.compose.MapProperties
import com.google.maps.android.compose.MapType
import com.google.maps.android.compose.Marker
import com.google.maps.android.compose.MarkerState
import com.google.maps.android.compose.Polyline
import com.google.maps.android.compose.rememberCameraPositionState
import com.example.neighbornet.AuthenticatedThumbnailImage
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.SnackbarResult
import com.example.neighbornet.R
import com.example.neighbornet.utils.MessageDialog
import com.google.maps.android.compose.CameraPositionState
import com.google.maps.android.compose.MapUiSettings
import kotlinx.coroutines.CoroutineScope


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MapScreen(
    viewModel: MapViewModel = hiltViewModel(),
    onNavigateToChat: (userId: Long, userName: String) -> Unit
) {
    val context = LocalContext.current
    val items by viewModel.items.collectAsState()
    val scope = rememberCoroutineScope()
    var selectedItem by remember { mutableStateOf<BorrowingItem?>(null) }
    var userLocation by remember { mutableStateOf<LatLng?>(null) }
    var destination by remember { mutableStateOf<LatLng?>(null) }
    var distanceText by remember { mutableStateOf("") }
    var isSelectingLocation by remember { mutableStateOf(false) }
    var isSelectingDestination by remember { mutableStateOf(false) }
    var showInstructions by remember { mutableStateOf(false) }
    var hasLocationPermission by remember { mutableStateOf(false) }
    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        hasLocationPermission = permissions.values.reduce { acc, isGranted -> acc && isGranted }
    }
    var selectedItemLocation by remember { mutableStateOf<LatLng?>(null) }
    val snackbarHostState = remember { SnackbarHostState() }
    val groupedItems = remember(items) { groupItemsByLocation(items) }
    var showItemsBottomSheet by remember { mutableStateOf(false) }
    var itemsToShow by remember { mutableStateOf<List<BorrowingItem>>(emptyList()) }
    val sheetState = rememberModalBottomSheetState()
    var showMessageDialog by remember { mutableStateOf(false) }

    // Cebu City coordinates
    val cebuCity = LatLng(10.3157, 123.8854)
    val cameraPositionState = rememberCameraPositionState {
        position = CameraPosition.fromLatLngZoom(cebuCity, 12f)
    }

    val mapUiSettings by remember {
        mutableStateOf(
            MapUiSettings(
                zoomControlsEnabled = false,
                myLocationButtonEnabled = false
            )
        )
    }

    LaunchedEffect(Unit) {
        val fineLocation = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_FINE_LOCATION
        )
        val coarseLocation = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_COARSE_LOCATION
        )
        hasLocationPermission = fineLocation == PackageManager.PERMISSION_GRANTED &&
                coarseLocation == PackageManager.PERMISSION_GRANTED

        if (!hasLocationPermission) {
            permissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                )
            )
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        GoogleMap(
            modifier = Modifier.fillMaxSize(),
            cameraPositionState = cameraPositionState,
            properties = MapProperties(
                isMyLocationEnabled = hasLocationPermission,
                mapType = MapType.NORMAL
            ),
            uiSettings = mapUiSettings,
            onMapClick = { latLng ->
                when {
                    isSelectingLocation -> {
                        userLocation = latLng
                        isSelectingLocation = false
                        showInstructions = false
                    }
                    isSelectingDestination -> {
                        destination = latLng
                        isSelectingDestination = false
                        showInstructions = false
                    }
                }

                // Calculate distance if both points exist
                if (userLocation != null && destination != null) {
                    val results = FloatArray(1)
                    Location.distanceBetween(
                        userLocation!!.latitude, userLocation!!.longitude,
                        destination!!.latitude, destination!!.longitude,
                        results
                    )
                    distanceText = "Distance: %.2f km".format(results[0] / 1000)
                }
            }
        ) {
            groupedItems.forEach { (location, itemsAtLocation) ->
                val itemLocation = LatLng(location.first, location.second)

                Marker(
                    state = MarkerState(itemLocation),
                    title = if (itemsAtLocation.size > 1) {
                        "${itemsAtLocation.size} items available"
                    } else {
                        itemsAtLocation.first().name
                    },
                    snippet = if (itemsAtLocation.size > 1) {
                        itemsAtLocation.joinToString("\n") { it.name }
                    } else {
                        "${itemsAtLocation.first().owner?.username ?: "Unknown"}\n${itemsAtLocation.first().description}"
                    },
                    onClick = {
                        if (itemsAtLocation.size > 1) {
                            scope.launch {
                                itemsToShow = itemsAtLocation
                                showItemsBottomSheet = true
                            }
                        } else {
                            selectedItem = itemsAtLocation.first()
                            handleItemSelection(
                                item = itemsAtLocation.first(),
                                userLocation = userLocation,
                                scope = scope,
                                snackbarHostState = snackbarHostState,
                                cameraPositionState = cameraPositionState,
                                onDistanceUpdate = { distanceText = it },
                                onDestinationUpdate = { destination = it },
                                onLocationSelect = {
                                    isSelectingLocation = true
                                    showInstructions = true
                                }
                            )
                        }
                        true
                    },
                    icon = if (itemsAtLocation.size > 1) {
                        BitmapDescriptorFactory.fromBitmap(
                            createClusterMarker(context, itemsAtLocation.size)
                        )
                    } else {
                        BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_RED)
                    }
                )
            }

            // Show user location marker
            userLocation?.let {
                Marker(
                    state = MarkerState(it),
                    title = "Your Location",
                    icon = BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_BLUE)
                )
            }

            // Show destination marker
            destination?.let {
                Marker(
                    state = MarkerState(it),
                    title = "Destination",
                    icon = BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_GREEN)
                )
            }

            // Show route line if both points exist
            if (userLocation != null && destination != null) {
                Polyline(
                    points = listOf(userLocation!!, destination!!),
                    color = Color.Blue,
                    width = 5f
                )
            }
        }

        SnackbarHost(
            hostState = snackbarHostState,
            modifier = Modifier
                .align(Alignment.TopCenter)
                .padding(top = 100.dp)
        )

        // Header
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

        // Instructions overlay
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

        // Selected item details
        selectedItem?.let { item ->
            Card(
                modifier = Modifier
                    .padding(16.dp)
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth(0.9f),
                elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(120.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(
                            modifier = Modifier
                                .weight(1f)
                                .padding(end = 8.dp)
                        ) {
                            Text(
                                text = item.name,
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Owner: ${item.owner?.username ?: "Unknown"}",
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }

                        Box(
                            modifier = Modifier
                                .size(120.dp)
                                .clip(RoundedCornerShape(8.dp))
                        ) {
                            AuthenticatedThumbnailImage(
                                url = item.imageUrls.firstOrNull(),
                                modifier = Modifier.fillMaxSize(),
                                contentDescription = item.name,
                                contentScale = ContentScale.Crop
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        color = MaterialTheme.colorScheme.surfaceVariant,
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = item.description,
                            style = MaterialTheme.typography.bodyMedium,
                            modifier = Modifier.padding(12.dp)
                        )
                    }

                    if (item.availabilityPeriod != null) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                Icons.Default.Schedule,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "Available: ${item.availabilityPeriod}",
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.End)
                    ) {
                        OutlinedButton(
                            onClick = { selectedItem = null }
                        ) {
                            Icon(Icons.Default.Close, contentDescription = null)
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Close")
                        }

                        Button(
                            onClick = { showMessageDialog = true },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.primary
                            )
                        ) {
                            Icon(Icons.Default.Chat, contentDescription = null)
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Chat with Owner")
                        }
                    }
                }
            }
        }

        // Action buttons
        Column(
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            FloatingActionButton(
                onClick = {
                    scope.launch {
                        cameraPositionState.animate(
                            update = CameraUpdateFactory.newLatLngZoom(cebuCity, 12f),
                            durationMs = 1000
                        )
                    }
                },
                containerColor = MaterialTheme.colorScheme.tertiary
            ) {
                Icon(Icons.Default.Home, "Return to Cebu")
            }

            FloatingActionButton(
                onClick = {
                    isSelectingLocation = true
                    showInstructions = true
                },
                containerColor = MaterialTheme.colorScheme.primary
            ) {
                Icon(Icons.Default.LocationOn, "Add Your Location")
            }

            FloatingActionButton(
                onClick = {
                    isSelectingDestination = true
                    showInstructions = true
                },
                containerColor = MaterialTheme.colorScheme.secondary
            ) {
                Icon(Icons.Default.Place, "Add Destination")
            }

            if (userLocation != null || destination != null) {
                FloatingActionButton(
                    onClick = {
                        userLocation = null
                        destination = null
                        distanceText = ""
                    },
                    containerColor = MaterialTheme.colorScheme.error
                ) {
                    Icon(Icons.Default.Delete, "Clear Markers")
                }
            }
        }

        if (showItemsBottomSheet) {
            ModalBottomSheet(
                onDismissRequest = { showItemsBottomSheet = false },
                sheetState = sheetState
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    Text(
                        text = "Items at this location",
                        style = MaterialTheme.typography.titleLarge,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )

                    itemsToShow.forEach { item ->
                        ListItem(
                            headlineContent = { Text(item.name) },
                            supportingContent = { Text(item.description) },
                            leadingContent = {
                                Icon(
                                    when (item.category) {
                                        "tools" -> Icons.Default.Build
                                        "books" -> Icons.Default.Book
                                        else -> Icons.Default.Category
                                    },
                                    contentDescription = null
                                )
                            },
                            modifier = Modifier.clickable {
                                selectedItem = item
                                showItemsBottomSheet = false
                                handleItemSelection(
                                    item = item,
                                    userLocation = userLocation,
                                    scope = scope,
                                    snackbarHostState = snackbarHostState,
                                    cameraPositionState = cameraPositionState,
                                    onDistanceUpdate = { distanceText = it },
                                    onDestinationUpdate = { destination = it },
                                    onLocationSelect = {
                                        isSelectingLocation = true
                                        showInstructions = true
                                    }
                                )
                            }
                        )
                        Divider()
                    }
                }
            }
        }
        selectedItem?.let { item ->
            if (showMessageDialog) {
                MessageDialog(
                    item = item,
                    onDismiss = { showMessageDialog = false },
                    onSendMessage = { message ->
                        showMessageDialog = false
                    },
                    onNavigateToChat = { userId, userName ->
                        onNavigateToChat(userId, userName)
                    }
                )
            }
        }
    }
}

private fun calculateDistance(start: LatLng, end: LatLng): String {
    val results = FloatArray(1)
    Location.distanceBetween(
        start.latitude, start.longitude,
        end.latitude, end.longitude,
        results
    )
    val distance = results[0]
    return when {
        distance < 1000 -> "%.0f meters".format(distance)
        else -> "%.2f km".format(distance / 1000)
    }
}

private fun groupItemsByLocation(items: List<BorrowingItem>): Map<Pair<Double, Double>, List<BorrowingItem>> {
    return items.groupBy { item ->
        Pair(item.latitude, item.longitude)
    }
}

private fun createClusterMarker(context: Context, count: Int): Bitmap {
    val view = FrameLayout(context)
    view.background = ContextCompat.getDrawable(context, R.drawable.circle_background)

    val text = TextView(context).apply {
        text = count.toString()
        setTextColor(Color(0xFFE91E63).toArgb())
        textSize = 12f
        gravity = android.view.Gravity.CENTER

        setPadding(0, 0, 0, dpToPx(context, 12f).toInt())
    }

    view.addView(text)
    view.measure(
        View.MeasureSpec.makeMeasureSpec(dpToPx(context, 36f).toInt(), View.MeasureSpec.EXACTLY),
        View.MeasureSpec.makeMeasureSpec(dpToPx(context, 48f).toInt(), View.MeasureSpec.EXACTLY)
    )
    view.layout(0, 0, view.measuredWidth, view.measuredHeight)

    // Create bitmap from view
    val bitmap = Bitmap.createBitmap(
        view.measuredWidth,
        view.measuredHeight,
        Bitmap.Config.ARGB_8888
    )
    val canvas = Canvas(bitmap)
    view.draw(canvas)

    return bitmap
}

private fun dpToPx(context: Context, dp: Float): Float {
    return dp * context.resources.displayMetrics.density
}

private fun handleItemSelection(
    item: BorrowingItem,
    userLocation: LatLng?,
    scope: CoroutineScope,
    snackbarHostState: SnackbarHostState,
    cameraPositionState: CameraPositionState,
    onDistanceUpdate: (String) -> Unit,
    onDestinationUpdate: (LatLng) -> Unit,
    onLocationSelect: () -> Unit
) {
    val itemLocation = LatLng(item.latitude, item.longitude)

    userLocation?.let { userLoc ->
        onDestinationUpdate(itemLocation)
        onDistanceUpdate("Distance to ${item.name}: ${calculateDistance(userLoc, itemLocation)}")
        scope.launch {
            animateCameraToShowPoints(cameraPositionState, userLoc, itemLocation)
        }
    } ?: run {
        scope.launch {
            val snackbarResult = snackbarHostState.showSnackbar(
                message = "Please set your location first",
                actionLabel = "Set Location"
            )
            if (snackbarResult == SnackbarResult.ActionPerformed) {
                onLocationSelect()
            } else {
                animateCameraToShowPoints(cameraPositionState, itemLocation)
            }
        }
    }
}

private suspend fun animateCameraToShowPoints(
    cameraPositionState: CameraPositionState,
    point1: LatLng,
    point2: LatLng? = null
) {
    if (point2 != null) {
        val bounds = com.google.android.gms.maps.model.LatLngBounds.Builder()
            .include(point1)
            .include(point2)
            .build()
        cameraPositionState.animate(
            update = CameraUpdateFactory.newLatLngBounds(bounds, 100),
            durationMs = 1000
        )
    } else {
        cameraPositionState.animate(
            update = CameraUpdateFactory.newLatLngZoom(point1, 15f),
            durationMs = 1000
        )
    }
}

