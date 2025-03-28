package com.example.neighbornet.utils

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.wrapContentHeight
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material3.Button
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BorrowingAgreementDialog(
    onDismiss: () -> Unit,
    onSubmit: (Map<String, Any>) -> Unit
) {
    var itemName by remember { mutableStateOf("") }
    var borrowingStart by remember { mutableStateOf("") }
    var borrowingEnd by remember { mutableStateOf("") }
    var terms by remember { mutableStateOf("") }
    var showDatePicker by remember { mutableStateOf(false) }
    var isStartDate by remember { mutableStateOf(true) }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .wrapContentHeight(),
            shape = RoundedCornerShape(16.dp),
            color = MaterialTheme.colorScheme.surface
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(
                    text = "Create Borrowing Agreement",
                    style = MaterialTheme.typography.titleLarge
                )

                OutlinedTextField(
                    value = itemName,
                    onValueChange = { itemName = it },
                    label = { Text("Item Name") },
                    modifier = Modifier.fillMaxWidth()
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = borrowingStart,
                        onValueChange = {},
                        label = { Text("Start Date") },
                        modifier = Modifier.weight(1f),
                        readOnly = true,
                        trailingIcon = {
                            IconButton(onClick = {
                                isStartDate = true
                                showDatePicker = true
                            }) {
                                Icon(Icons.Default.DateRange, "Select start date")
                            }
                        }
                    )

                    OutlinedTextField(
                        value = borrowingEnd,
                        onValueChange = {},
                        label = { Text("End Date") },
                        modifier = Modifier.weight(1f),
                        readOnly = true,
                        trailingIcon = {
                            IconButton(onClick = {
                                isStartDate = false
                                showDatePicker = true
                            }) {
                                Icon(Icons.Default.DateRange, "Select end date")
                            }
                        }
                    )
                }

                OutlinedTextField(
                    value = terms,
                    onValueChange = { terms = it },
                    label = { Text("Terms") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 3,
                    maxLines = 5
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Cancel")
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            val agreementData = mapOf(
                                "itemName" to itemName,
                                "borrowingStart" to borrowingStart,
                                "borrowingEnd" to borrowingEnd,
                                "terms" to terms
                            )
                            onSubmit(agreementData)
                        },
                        enabled = itemName.isNotBlank() &&
                                borrowingStart.isNotBlank() &&
                                borrowingEnd.isNotBlank() &&
                                terms.isNotBlank()
                    ) {
                        Text("Submit")
                    }
                }
            }
        }
    }

    if (showDatePicker) {
        val datePickerState = rememberDatePickerState()
        DatePickerDialog(
            onDismissRequest = { showDatePicker = false },
            confirmButton = {
                TextButton(onClick = {
                    datePickerState.selectedDateMillis?.let { millis ->
                        val date = Instant.ofEpochMilli(millis)
                            .atZone(ZoneId.systemDefault())
                            .toLocalDate()
                            .format(DateTimeFormatter.ISO_DATE)
                        if (isStartDate) {
                            borrowingStart = date
                        } else {
                            borrowingEnd = date
                        }
                    }
                    showDatePicker = false
                }) {
                    Text("OK")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDatePicker = false }) {
                    Text("Cancel")
                }
            }
        ) {
            DatePicker(state = datePickerState)
        }
    }
}