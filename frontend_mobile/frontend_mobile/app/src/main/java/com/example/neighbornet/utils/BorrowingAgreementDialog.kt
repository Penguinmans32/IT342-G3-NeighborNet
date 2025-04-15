package com.example.neighbornet.utils

import android.util.Log
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.wrapContentHeight
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.SelectableDates
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.neighbornet.AuthenticatedThumbnailImage
import com.example.neighbornet.auth.ChatViewModel
import com.example.neighbornet.network.Item
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BorrowingAgreementDialog(
    receiverId: Long,
    senderId: Long,
    onDismiss: () -> Unit,
    onSubmit: (Map<String, Any>) -> Unit,
    viewModel: ChatViewModel,
    modifier: Modifier = Modifier
) {

    var showStartDatePicker by remember { mutableStateOf(false) }
    var showEndDatePicker by remember { mutableStateOf(false) }

    var selectedItem by remember { mutableStateOf<Item?>(null) }
    var borrowingStart by remember { mutableStateOf("") }
    var borrowingEnd by remember { mutableStateOf("") }
    var terms by remember { mutableStateOf("") }
    var isDropDownExpanded by remember { mutableStateOf(false) }

    // Fetch data once and store it in stable remembered variables
    val itemsState by viewModel.userItems.collectAsState()
    val isLoading by viewModel.isLoadingItems.collectAsState(false)
    val error by viewModel.itemsError.collectAsState("")

    val items = remember(itemsState) { itemsState }
    val loadingState = remember(isLoading) { isLoading }

    val dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
    val displayDateFormatter = DateTimeFormatter.ofPattern("MMM dd, yyyy")

    // Fetch items when dialog opens
    LaunchedEffect(receiverId) {
        Log.d("BorrowingDialog", "Fetching items for user: $receiverId")
        viewModel.fetchUserItems(receiverId)
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = modifier
                .fillMaxWidth(0.95f)
                .wrapContentHeight()
                .padding(16.dp),
            shape = RoundedCornerShape(16.dp),
            color = MaterialTheme.colorScheme.surface
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp)
            ) {
                Text(
                    "Create Borrowing Agreement",
                    style = MaterialTheme.typography.headlineSmall,
                    modifier = Modifier.padding(bottom = 16.dp)
                )

                // SIMPLIFIED ITEM SELECTOR - Replace ExposedDropdownMenuBox which causes issues
                Column(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "Select Item",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(start = 4.dp, bottom = 4.dp)
                    )

                    // Custom dropdown trigger
                    Box(modifier = Modifier.fillMaxWidth()) {
                        OutlinedTextField(
                            value = selectedItem?.name ?: "",
                            onValueChange = { },
                            readOnly = true,
                            enabled = !loadingState && items.isNotEmpty(),
                            trailingIcon = {
                                if (loadingState) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(24.dp),
                                        strokeWidth = 2.dp
                                    )
                                } else {
                                    Icon(
                                        imageVector = if (isDropDownExpanded)
                                            Icons.Default.KeyboardArrowUp
                                        else
                                            Icons.Default.KeyboardArrowDown,
                                        contentDescription = "Toggle dropdown"
                                    )
                                }
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable(
                                    enabled = !loadingState && items.isNotEmpty(),
                                    onClick = { isDropDownExpanded = !isDropDownExpanded }
                                )
                        )

                        // Make the whole field clickable
                        if (!loadingState && items.isNotEmpty()) {
                            Box(
                                modifier = Modifier
                                    .matchParentSize()
                                    .clickable { isDropDownExpanded = !isDropDownExpanded }
                            )
                        }
                    }

                    // Custom dropdown menu
                    AnimatedVisibility(
                        visible = isDropDownExpanded && !loadingState && items.isNotEmpty(),
                        enter = expandVertically() + fadeIn(),
                        exit = shrinkVertically() + fadeOut()
                    ) {
                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 4.dp),
                            shape = RoundedCornerShape(8.dp),
                            tonalElevation = 2.dp,
                            shadowElevation = 4.dp
                        ) {
                            LazyColumn(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .heightIn(max = 250.dp)
                            ) {
                                items(items.size) { index ->
                                    val item = items[index]
                                    ItemDropdownRow(
                                        item = item,
                                        onClick = {
                                            selectedItem = item
                                            isDropDownExpanded = false
                                            Log.d("BorrowingDialog", "Selected item: ${item.name}")
                                        }
                                    )
                                }
                            }
                        }
                    }
                }

                if (items.isEmpty() && !loadingState) {
                    Text(
                        "No items available for borrowing",
                        style = MaterialTheme.typography.bodyMedium,
                        modifier = Modifier.padding(vertical = 8.dp)
                    )
                }

                // Date Selection with improved pickers
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    OutlinedTextField(
                        value = if (borrowingStart.isNotEmpty())
                            LocalDate.parse(borrowingStart).format(displayDateFormatter)
                        else "",
                        onValueChange = { },
                        readOnly = true,
                        label = { Text("Start Date") },
                        trailingIcon = {
                            IconButton(onClick = {
                                Log.d("BorrowingDialog", "Opening start date picker")
                                showStartDatePicker = true
                            }) {
                                Icon(Icons.Default.DateRange, "Select start date")
                            }
                        },
                        modifier = Modifier
                            .weight(1f)
                            .padding(end = 8.dp)
                    )

                    OutlinedTextField(
                        value = if (borrowingEnd.isNotEmpty())
                            LocalDate.parse(borrowingEnd).format(displayDateFormatter)
                        else "",
                        onValueChange = { },
                        readOnly = true,
                        label = { Text("End Date") },
                        trailingIcon = {
                            IconButton(onClick = {
                                Log.d("BorrowingDialog", "Opening end date picker")
                                showEndDatePicker = true
                            }) {
                                Icon(Icons.Default.DateRange, "Select end date")
                            }
                        },
                        modifier = Modifier
                            .weight(1f)
                            .padding(start = 8.dp)
                    )
                }

                if (selectedItem != null) {
                    Spacer(modifier = Modifier.height(16.dp))
                    SimplifiedItemPreview(item = selectedItem!!)
                }

                OutlinedTextField(
                    value = terms,
                    onValueChange = { terms = it },
                    label = { Text("Terms and Conditions") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp)
                        .height(120.dp),
                    maxLines = 5
                )

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 16.dp),
                    horizontalArrangement = Arrangement.End
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Cancel")
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            if (selectedItem != null) {
                                val startDateTime = LocalDate.parse(borrowingStart)
                                    .atStartOfDay()
                                    .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS"))
                                val endDateTime = LocalDate.parse(borrowingEnd)
                                    .atStartOfDay()
                                    .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS"))

                                Log.d("BorrowingAgreement", "Start Date: $startDateTime")
                                Log.d("BorrowingAgreement", "End Date: $endDateTime")

                                val agreementData = mapOf(
                                    "itemId" to selectedItem!!.id.toLong(),
                                    "lenderId" to receiverId,
                                    "borrowerId" to senderId,
                                    "borrowingStart" to startDateTime,
                                    "borrowingEnd" to endDateTime,
                                    "terms" to terms
                                )
                                onSubmit(agreementData)
                                onDismiss()
                            }
                        },
                        enabled = selectedItem != null && borrowingStart.isNotEmpty()
                                && borrowingEnd.isNotEmpty() && terms.isNotEmpty()
                    ) {
                        Text("Send Agreement")
                    }
                }
            }
        }
    }

    if (showStartDatePicker) {
        SimpleDatePickerDialog(
            onDismiss = { showStartDatePicker = false },
            onDateSelected = { date ->
                borrowingStart = date.format(dateFormatter)
                showStartDatePicker = false
                Log.d("BorrowingDialog", "Selected start date: $borrowingStart")
            },
            initialDate = if (borrowingStart.isNotEmpty())
                LocalDate.parse(borrowingStart)
            else
                LocalDate.now(),
            minDate = selectedItem?.let {
                try {
                    LocalDate.parse(it.availableFrom.substring(0, 10))
                } catch (e: Exception) {
                    LocalDate.now()
                }
            } ?: LocalDate.now(),
            maxDate = selectedItem?.let {
                try {
                    LocalDate.parse(it.availableUntil.substring(0, 10))
                } catch (e: Exception) {
                    LocalDate.now().plusYears(1)
                }
            } ?: LocalDate.now().plusYears(1)
        )
    }

    if (showEndDatePicker) {
        SimpleDatePickerDialog(
            onDismiss = { showEndDatePicker = false },
            onDateSelected = { date ->
                borrowingEnd = date.format(dateFormatter)
                showEndDatePicker = false
                Log.d("BorrowingDialog", "Selected end date: $borrowingEnd")
            },
            initialDate = if (borrowingEnd.isNotEmpty())
                LocalDate.parse(borrowingEnd)
            else
                LocalDate.now(),
            minDate = if (borrowingStart.isNotEmpty())
                LocalDate.parse(borrowingStart)
            else LocalDate.now(),
            maxDate = selectedItem?.let {
                try {
                    LocalDate.parse(it.availableUntil.substring(0, 10))
                } catch (e: Exception) {
                    LocalDate.now().plusYears(1)
                }
            } ?: LocalDate.now().plusYears(1)
        )
    }
}

@Composable
fun ItemDropdownRow(item: Item, onClick: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(vertical = 8.dp, horizontal = 16.dp)
    ) {
        Text(
            text = item.name,
            style = MaterialTheme.typography.bodyLarge,
            fontWeight = FontWeight.Medium
        )

        if (!item.availableFrom.isNullOrBlank() && !item.availableUntil.isNullOrBlank()) {
            val from = try {
                item.availableFrom.substring(0, 10)
            } catch (e: Exception) {
                item.availableFrom
            }
            val to = try {
                item.availableUntil.substring(0, 10)
            } catch (e: Exception) {
                item.availableUntil
            }
            Text(
                text = "Available: $from - $to",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun SimplifiedItemPreview(item: Item) {
    // Use remember to stabilize the imageUrl
    val imageUrl = remember(item.id, item.imageUrls) {
        item.imageUrls.firstOrNull()?.let { url ->
            if (url.contains("localhost")) {
                url.replace("http://localhost:8080", "http://10.0.191.212:8080")
            } else {
                url
            }
        }
    }

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        shape = RoundedCornerShape(12.dp),
        tonalElevation = 1.dp,
        color = MaterialTheme.colorScheme.surface
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "Selected Item Preview",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.padding(bottom = 12.dp)
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Image preview
                if (!item.imageUrls.isNullOrEmpty() && imageUrl != null) {
                    Surface(
                        modifier = Modifier
                            .size(100.dp)
                            .clip(RoundedCornerShape(8.dp)),
                        shadowElevation = 2.dp
                    ) {
                        Box(modifier = Modifier.fillMaxSize()) {
                            AuthenticatedThumbnailImage(
                                url = imageUrl,
                                modifier = Modifier.fillMaxSize(),
                                contentDescription = item.name,
                                contentScale = ContentScale.Crop
                            )
                        }
                    }
                }

                // Item details
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = item.name,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = "Category: ${item.category}",
                        style = MaterialTheme.typography.bodyMedium
                    )

                    Spacer(modifier = Modifier.height(2.dp))

                    Text(
                        text = "Location: ${item.location}",
                        style = MaterialTheme.typography.bodySmall,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )

                    if (!item.description.isNullOrBlank()) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Description: ${item.description}",
                            style = MaterialTheme.typography.bodySmall,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SimpleDatePickerDialog(
    onDismiss: () -> Unit,
    onDateSelected: (LocalDate) -> Unit,
    initialDate: LocalDate,
    minDate: LocalDate,
    maxDate: LocalDate
) {
    val datePickerState = rememberDatePickerState(
        initialSelectedDateMillis = initialDate.atStartOfDay(ZoneId.systemDefault())
            .toInstant().toEpochMilli(),
        selectableDates = object : SelectableDates {
            override fun isSelectableDate(utcTimeMillis: Long): Boolean {
                val date = Instant.ofEpochMilli(utcTimeMillis)
                    .atZone(ZoneId.systemDefault())
                    .toLocalDate()
                return !date.isBefore(minDate) && !date.isAfter(maxDate)
            }
        }
    )

    DatePickerDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            TextButton(onClick = {
                datePickerState.selectedDateMillis?.let { millis ->
                    val localDate = Instant.ofEpochMilli(millis)
                        .atZone(ZoneId.systemDefault())
                        .toLocalDate()
                    onDateSelected(localDate)
                }
            }) {
                Text("OK")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    ) {
        DatePicker(
            state = datePickerState,
            showModeToggle = false
        )
    }
}