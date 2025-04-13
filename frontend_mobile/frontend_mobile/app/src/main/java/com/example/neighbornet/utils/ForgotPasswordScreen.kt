package com.example.neighbornet.utils

import android.util.Log
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.neighbornet.auth.ForgotPasswordUiState
import com.example.neighbornet.auth.ForgotPasswordViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun ForgotPasswordScreen(
    viewModel: ForgotPasswordViewModel = hiltViewModel(),
    onNavigateToLogin: () -> Unit
) {
    val currentStage by viewModel.currentStage.collectAsState()
    val uiState by viewModel.uiState.collectAsState()
    val email by viewModel.email.collectAsState()
    val emailError by viewModel.emailError.collectAsState()
    val otpDigits by viewModel.otpDigits.collectAsState()
    val otpError by viewModel.otpError.collectAsState()
    val passwordError by viewModel.passwordError.collectAsState()
    val canResend by viewModel.canResend.collectAsState()
    val resendTimer by viewModel.resendTimer.collectAsState()
    val oauthProvider by viewModel.oauthProvider.collectAsState()

    val isLoading = uiState is ForgotPasswordUiState.Loading

    var currentPassword by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }

    val focusManager = LocalFocusManager.current
    val coroutineScope = rememberCoroutineScope()
    val context = LocalContext.current

    // Handle UI state changes
    LaunchedEffect(uiState) {
        when (uiState) {
            is ForgotPasswordUiState.PasswordReset -> {
                // Show success message and navigate to login
                coroutineScope.launch {
                    // You can show a Snackbar or Toast here
                    delay(1500) // Wait for success animation
                    onNavigateToLogin()
                }
            }
            else -> {} // Handle other states as needed
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            AnimatedVisibility(
                visible = true,
                enter = fadeIn() + slideInVertically(),
                exit = fadeOut() + slideOutVertically()
            ) {
                Icon(
                    imageVector = when (currentStage) {
                        1 -> Icons.Default.Email
                        2 -> Icons.Default.Email // Use a verification icon if available
                        3 -> Icons.Default.Lock
                        else -> Icons.Default.Email
                    },
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier
                        .size(72.dp)
                        .padding(bottom = 24.dp)
                )
            }

            AnimatedVisibility(
                visible = true,
                enter = fadeIn() + expandVertically(),
                exit = fadeOut() + shrinkVertically()
            ) {
                Text(
                    text = when (currentStage) {
                        1 -> "Forgot Password?"
                        2 -> "Enter OTP"
                        3 -> "Set New Password"
                        else -> "Forgot Password?"
                    },
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
            }

            AnimatedVisibility(
                visible = true,
                enter = fadeIn() + expandVertically(),
                exit = fadeOut() + shrinkVertically()
            ) {
                Text(
                    text = when (currentStage) {
                        1 -> "Don't worry, we'll help you reset it."
                        2 -> "We've sent a code to $email"
                        3 -> "Create a strong password for your account"
                        else -> ""
                    },
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(bottom = 24.dp)
                )
            }

            // OAuth account message
            AnimatedVisibility(visible = oauthProvider != null) {
                OAuthAccountMessage(
                    provider = oauthProvider ?: "",
                    onDismiss = { viewModel.resetForm() }
                )
            }

            AnimatedVisibility(visible = currentStage == 1 && oauthProvider == null) {
                EmailForm(
                    email = email,
                    onEmailChange = { viewModel.updateEmail(it) },
                    onSubmit = { viewModel.sendResetEmail() },
                    isLoading = isLoading,
                    emailError = emailError
                )
            }

            AnimatedVisibility(visible = currentStage == 2) {
                OtpForm(
                    otpDigits = otpDigits,
                    onOtpChange = { index, value -> viewModel.updateOtpDigit(index, value) },
                    onSubmit = { viewModel.verifyOtp() },
                    isLoading = isLoading,
                    canResend = canResend,
                    resendTimer = resendTimer,
                    onResendClick = { viewModel.resendOtp() },
                    otpError = otpError
                )
            }

            AnimatedVisibility(visible = currentStage == 3) {
                PasswordForm(
                    currentPassword = currentPassword,
                    newPassword = newPassword,
                    confirmPassword = confirmPassword,
                    onCurrentPasswordChange = { currentPassword = it },
                    onNewPasswordChange = { newPassword = it },
                    onConfirmPasswordChange = { confirmPassword = it },
                    onSubmit = { viewModel.resetPassword(currentPassword, newPassword, confirmPassword) },
                    isLoading = isLoading,
                    passwordError = passwordError
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            TextButton(
                onClick = onNavigateToLogin
            ) {
                Text("Back to Login")
            }
        }

        // Show loading indicator
        if (isLoading) {
            Box(
                modifier = Modifier
                    .matchParentSize()
                    .background(Color.Black.copy(alpha = 0.5f)),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
            }
        }
    }
}

@Composable
fun EmailForm(
    email: String,
    onEmailChange: (String) -> Unit,
    onSubmit: () -> Unit,
    isLoading: Boolean,
    emailError: String?
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        OutlinedTextField(
            value = email,
            onValueChange = onEmailChange,
            label = { Text("Email Address") },
            leadingIcon = { Icon(Icons.Default.Email, contentDescription = null) },
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Email,
                imeAction = ImeAction.Done
            ),
            keyboardActions = KeyboardActions(onDone = { onSubmit() }),
            isError = emailError != null,
            singleLine = true,
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 8.dp)
        )

        if (emailError != null) {
            Text(
                text = emailError,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.padding(start = 8.dp, bottom = 8.dp)
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = onSubmit,
            enabled = email.isNotEmpty() && !isLoading,
            modifier = Modifier.fillMaxWidth()
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    color = MaterialTheme.colorScheme.onPrimary,
                    modifier = Modifier.size(24.dp)
                )
            } else {
                Text("Send Reset Link")
            }
        }
    }
}

@Composable
fun OtpForm(
    otpDigits: List<String>,
    onOtpChange: (Int, String) -> Unit,
    onSubmit: () -> Unit,
    isLoading: Boolean,
    canResend: Boolean,
    resendTimer: Int,
    onResendClick: () -> Unit,
    otpError: String?
) {
    val focusRequesters = List(6) { FocusRequester() }

    Column(modifier = Modifier.fillMaxWidth()) {
        // Email verification notice
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)
            )
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    Icons.Default.Email,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(end = 12.dp)
                )
                Text(
                    "Can't find the email? Please check your spam/junk folder.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onPrimaryContainer
                )
            }
        }

        // OTP input fields
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            otpDigits.forEachIndexed { index, digit ->
                OutlinedTextField(
                    value = digit,
                    onValueChange = { newValue ->
                        if (newValue.length <= 1) {
                            onOtpChange(index, newValue)
                            if (newValue.isNotEmpty() && index < 5) {
                                focusRequesters[index + 1].requestFocus()
                            }
                        }
                    },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    singleLine = true,
                    textStyle = MaterialTheme.typography.titleLarge.copy(textAlign = TextAlign.Center),
                    modifier = Modifier
                        .weight(1f)
                        .padding(horizontal = 4.dp)
                        .height(56.dp)
                        .focusRequester(focusRequesters[index]),
                    isError = otpError != null
                )
            }
        }

        if (otpError != null) {
            Text(
                text = otpError,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.padding(start = 8.dp, top = 8.dp)
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = onSubmit,
            enabled = otpDigits.all { it.isNotEmpty() } && !isLoading,
            modifier = Modifier.fillMaxWidth()
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    color = MaterialTheme.colorScheme.onPrimary,
                    modifier = Modifier.size(24.dp)
                )
            } else {
                Text("Verify OTP")
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                "Didn't receive the code? ",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            if (canResend) {
                Text(
                    "Resend",
                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.clickable(enabled = !isLoading) { onResendClick() }
                )
            } else {
                Text(
                    "Resend in ${resendTimer}s",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
                )
            }
        }
    }

    LaunchedEffect(Unit) {
        focusRequesters[0].requestFocus()
    }
}

@Composable
fun PasswordForm(
    currentPassword: String,
    newPassword: String,
    confirmPassword: String,
    onCurrentPasswordChange: (String) -> Unit,
    onNewPasswordChange: (String) -> Unit,
    onConfirmPasswordChange: (String) -> Unit,
    onSubmit: () -> Unit,
    isLoading: Boolean,
    passwordError: String?
) {
    // Track visibility state for each password field
    var currentPasswordVisible by remember { mutableStateOf(false) }
    var newPasswordVisible by remember { mutableStateOf(false) }
    var confirmPasswordVisible by remember { mutableStateOf(false) }

    Column(modifier = Modifier.fillMaxWidth()) {
        OutlinedTextField(
            value = currentPassword,
            onValueChange = onCurrentPasswordChange,
            label = { Text("Current Password") },
            leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null) },
            trailingIcon = {
                IconButton(onClick = { currentPasswordVisible = !currentPasswordVisible }) {
                    Icon(
                        imageVector = if (currentPasswordVisible)
                            Icons.Default.Visibility
                        else
                            Icons.Default.VisibilityOff,
                        contentDescription = if (currentPasswordVisible) "Hide password" else "Show password"
                    )
                }
            },
            visualTransformation = if (currentPasswordVisible)
                VisualTransformation.None
            else
                PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Password,
                imeAction = ImeAction.Next
            ),
            singleLine = true,
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp)
        )

        OutlinedTextField(
            value = newPassword,
            onValueChange = onNewPasswordChange,
            label = { Text("New Password") },
            leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null) },
            trailingIcon = {
                IconButton(onClick = { newPasswordVisible = !newPasswordVisible }) {
                    Icon(
                        imageVector = if (newPasswordVisible)
                            Icons.Default.Visibility
                        else
                            Icons.Default.VisibilityOff,
                        contentDescription = if (newPasswordVisible) "Hide password" else "Show password"
                    )
                }
            },
            visualTransformation = if (newPasswordVisible)
                VisualTransformation.None
            else
                PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Password,
                imeAction = ImeAction.Next
            ),
            singleLine = true,
            isError = passwordError != null,
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp)
        )

        OutlinedTextField(
            value = confirmPassword,
            onValueChange = onConfirmPasswordChange,
            label = { Text("Confirm Password") },
            leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null) },
            trailingIcon = {
                IconButton(onClick = { confirmPasswordVisible = !confirmPasswordVisible }) {
                    Icon(
                        imageVector = if (confirmPasswordVisible)
                            Icons.Default.Visibility
                        else
                            Icons.Default.VisibilityOff,
                        contentDescription = if (confirmPasswordVisible) "Hide password" else "Show password"
                    )
                }
            },
            visualTransformation = if (confirmPasswordVisible)
                VisualTransformation.None
            else
                PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Password,
                imeAction = ImeAction.Done
            ),
            keyboardActions = KeyboardActions(onDone = { onSubmit() }),
            singleLine = true,
            isError = passwordError != null,
            modifier = Modifier.fillMaxWidth()
        )

        if (passwordError != null) {
            Text(
                text = passwordError,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.padding(start = 8.dp, top = 8.dp)
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = onSubmit,
            enabled = currentPassword.isNotEmpty() && newPassword.isNotEmpty() && confirmPassword.isNotEmpty() && !isLoading,
            modifier = Modifier.fillMaxWidth()
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    color = MaterialTheme.colorScheme.onPrimary,
                    modifier = Modifier.size(24.dp)
                )
            } else {
                Text("Reset Password")
            }
        }

        // Password strength indicators
        if (newPassword.isNotEmpty()) {
            Spacer(modifier = Modifier.height(16.dp))
            PasswordStrengthIndicator(newPassword)
        }
    }
}

@Composable
fun OAuthAccountMessage(
    provider: String,
    onDismiss: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                text = "Social Login Account",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            Text(
                text = "This account uses $provider for authentication. To change your password:",
                style = MaterialTheme.typography.bodyMedium
            )

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp)
            ) {
                Text("1. Visit $provider's account settings")
                Text("2. Look for security or password settings")
                Text("3. Follow $provider's password reset process")
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                TextButton(onClick = {
                    // Open provider website in browser
                    val url = when (provider.lowercase()) {
                        "google" -> "https://myaccount.google.com/security"
                        "github" -> "https://github.com/settings/security"
                        "microsoft" -> "https://account.live.com/password/reset"
                        else -> null
                    }
                    // You would normally use an Intent to open this URL
                    Log.d("ForgotPassword", "Would open URL: $url")
                }) {
                    Text("Go to $provider")
                }

                Button(onClick = onDismiss) {
                    Text("Try Different Email")
                }
            }
        }
    }
}

@Composable
fun PasswordStrengthIndicator(password: String) {
    val hasMinLength = password.length >= 8
    val hasUppercase = password.any { it.isUpperCase() }
    val hasNumber = password.any { it.isDigit() }
    val hasSpecialChar = password.any { !it.isLetterOrDigit() }

    val strength = when {
        password.isEmpty() -> 0
        hasMinLength && hasUppercase && hasNumber && hasSpecialChar -> 4
        hasMinLength && (hasUppercase || hasNumber || hasSpecialChar) -> 3
        hasMinLength -> 2
        else -> 1
    }

    val strengthPercentage = when (strength) {
        0 -> 0f
        1 -> 0.25f
        2 -> 0.5f
        3 -> 0.75f
        else -> 1f
    }

    val strengthColor = when (strength) {
        0 -> Color.Transparent
        1 -> Color.Red
        2 -> Color.Gray
        3 -> Color.Yellow
        else -> Color.Green
    }

    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = "Password Strength",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(bottom = 4.dp)
        )

        // Use a Box with a fractionalWidth approach instead of weights
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(4.dp)
                .background(Color.Gray.copy(alpha = 0.2f), RoundedCornerShape(2.dp))
        ) {
            Box(
                modifier = Modifier
                    .fillMaxHeight()
                    .fillMaxWidth(strengthPercentage)
                    .background(strengthColor, RoundedCornerShape(2.dp))
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Password requirements
        PasswordRequirement(text = "At least 8 characters", isMet = hasMinLength)
        PasswordRequirement(text = "Contains uppercase letter", isMet = hasUppercase)
        PasswordRequirement(text = "Contains number", isMet = hasNumber)
        PasswordRequirement(text = "Contains special character", isMet = hasSpecialChar)
    }
}

@Composable
fun PasswordRequirement(
    text: String,
    isMet: Boolean
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.padding(vertical = 2.dp)
    ) {
        Box(
            modifier = Modifier
                .size(16.dp)
                .clip(CircleShape)
                .background(if (isMet) Color.Green else Color.Gray.copy(alpha = 0.3f)),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "✓",
                color = if (isMet) Color.White else Color.Gray.copy(alpha = 0.5f),
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold
            )
        }

        Text(
            text = text,
            style = MaterialTheme.typography.bodySmall,
            color = if (isMet) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
            modifier = Modifier.padding(start = 8.dp)
        )
    }
}