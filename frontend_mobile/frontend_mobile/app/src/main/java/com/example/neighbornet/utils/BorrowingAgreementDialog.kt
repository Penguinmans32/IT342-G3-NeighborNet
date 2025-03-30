package com.example.neighbornet.utils

import android.util.Log
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.wrapContentHeight
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import coil.compose.AsyncImage
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
    var selectedItem by remember { mutableStateOf<Item?>(null) }
    var borrowingStart by remember { mutableStateOf("") }
    var borrowingEnd by remember { mutableStateOf("") }
    var terms by remember { mutableStateOf("") }
    var isDropDownExpanded by remember { mutableStateOf(false) }

    val items by viewModel.userItems.collectAsState()
    var showStartDatePicker by remember { mutableStateOf(false) }
    var showEndDatePicker by remember { mutableStateOf(false) }
    val isLoading by viewModel.isLoadingItems.collectAsState()
    val error by viewModel.itemsError.collectAsState()

    val dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
    val displayDateFormatter = DateTimeFormatter.ofPattern("MMM dd, yyyy")

    // Fetch items when dialog opens
    LaunchedEffect(receiverId) {
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

                // Item Selection with improved dropdown
                ExposedDropdownMenuBox(
                    expanded = isDropDownExpanded,
                    onExpandedChange = { isDropDownExpanded = it },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    OutlinedTextField(
                        value = selectedItem?.name ?: "",
                        onValueChange = { },
                        readOnly = true,
                        label = { Text("Select Item") },
                        trailingIcon = {
                            if (isLoading) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(24.dp),
                                    strokeWidth = 2.dp
                                )
                            } else {
                                ExposedDropdownMenuDefaults.TrailingIcon(expanded = isDropDownExpanded)
                            }
                        },
                        enabled = !isLoading,
                        modifier = Modifier
                            .menuAnchor()
                            .fillMaxWidth()
                    )

                    if (!isLoading && error == null) {
                        ExposedDropdownMenu(
                            expanded = isDropDownExpanded,
                            onDismissRequest = { isDropDownExpanded = false }
                        ) {
                            if (items.isEmpty()) {
                                DropdownMenuItem(
                                    text = { Text("No items available") },
                                    onClick = { }
                                )
                            } else {
                                items.forEach { item ->
                                    DropdownMenuItem(
                                        text = {
                                            Column {
                                                Text(item.name)
                                                Text(
                                                    "Available: ${item.availableFrom.substring(0, 10)} - ${item.availableUntil.substring(0, 10)}",
                                                    style = MaterialTheme.typography.bodySmall
                                                )
                                            }
                                        },
                                        onClick = {
                                            selectedItem = item
                                            isDropDownExpanded = false
                                        }
                                    )
                                }
                            }
                        }
                    }
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
                            IconButton(onClick = { showStartDatePicker = true }) {
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
                            IconButton(onClick = { showEndDatePicker = true }) {
                                Icon(Icons.Default.DateRange, "Select end date")
                            }
                        },
                        modifier = Modifier
                            .weight(1f)
                            .padding(start = 8.dp)
                    )
                }

                // Selected Item Preview
                if (selectedItem != null) {
                    Spacer(modifier = Modifier.height(16.dp))
                    ItemPreview(item = selectedItem!!)
                }

                // Terms Input
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

                // Buttons
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

    // Improved Date Pickers
    if (showStartDatePicker || showEndDatePicker) {
        val initialDate = if (showStartDatePicker && borrowingStart.isNotEmpty()) {
            LocalDate.parse(borrowingStart)
        } else if (showEndDatePicker && borrowingEnd.isNotEmpty()) {
            LocalDate.parse(borrowingEnd)
        } else {
            LocalDate.now()
        }

        val minDate = if (showStartDatePicker) {
            selectedItem?.let { LocalDate.parse(it.availableFrom.substring(0, 10)) }
                ?: LocalDate.now()
        } else {
            borrowingStart.takeIf { it.isNotEmpty() }?.let { LocalDate.parse(it) }
                ?: LocalDate.now()
        }

        val maxDate = selectedItem?.let { LocalDate.parse(it.availableUntil.substring(0, 10)) }
            ?: LocalDate.now().plusYears(1)

        DatePickerDialog(
            onDismissRequest = {
                if (showStartDatePicker) showStartDatePicker = false
                else showEndDatePicker = false
            },
            onDateSelected = { date ->
                if (showStartDatePicker) {
                    borrowingStart = date.format(dateFormatter)
                    showStartDatePicker = false
                } else {
                    borrowingEnd = date.format(dateFormatter)
                    showEndDatePicker = false
                }
            },
            initialDate = initialDate,
            minDate = minDate,
            maxDate = maxDate
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DatePickerDialog(
    onDismissRequest: () -> Unit,
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
        onDismissRequest = onDismissRequest,
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
            TextButton(onClick = onDismissRequest) {
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

@Composable
fun ItemPreview(item: Item) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp)
    ) {
        Text(
            "Selected Item Preview",
            style = MaterialTheme.typography.titleMedium,
            modifier = Modifier.padding(bottom = 8.dp)
        )

        if (item.imageUrls.isNotEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp)
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

        Spacer(modifier = Modifier.height(8.dp))

        Text("Name: ${item.name}")
        Text("Category: ${item.category}")
        Text("Location: ${item.location}")
        if (item.description != null) {
            Text("Description: ${item.description}")
        }
    }
}