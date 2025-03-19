package com.example.neighbornet

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Error
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shadow
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.neighbornet.auth.AuthViewModel
import com.example.neighbornet.utils.shimmerEffect
import kotlinx.coroutines.delay

@Composable
fun VerificationScreen(
    viewModel: AuthViewModel,
    onVerificationComplete: () -> Unit
) {
    var otp by remember { mutableStateOf("") }
    val authState by viewModel.authState.collectAsState()
    var otpDigits by remember { mutableStateOf(List(6) { "" }) }
    var currentFocusIndex by remember { mutableStateOf(0) }

    // Animation states
    val scale by animateFloatAsState(
        targetValue = if (authState.verificationSuccess) 1.1f else 1f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy)
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        MaterialTheme.colorScheme.background,
                        MaterialTheme.colorScheme.background.copy(alpha = 0.8f)
                    )
                )
            )
    ) {
        // Floating background elements
        FloatingElements()

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(48.dp))

            // Animated Icon
            Box(
                modifier = Modifier
                    .size(120.dp)
                    .scale(scale)
                    .shadow(
                        elevation = 8.dp,
                        shape = CircleShape,
                        spotColor = MaterialTheme.colorScheme.primary
                    )
                    .background(
                        brush = Brush.radialGradient(
                            colors = listOf(
                                MaterialTheme.colorScheme.primary,
                                MaterialTheme.colorScheme.primary.copy(alpha = 0.8f)
                            )
                        ),
                        shape = CircleShape
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Email,
                    contentDescription = "Email Verification",
                    modifier = Modifier
                        .size(64.dp)
                        .scale(scale),
                    tint = Color.White
                )
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Enhanced Title and Subtitle
            Text(
                text = "Verify Your Email",
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground,
                style = MaterialTheme.typography.headlineMedium.copy(
                    shadow = Shadow(
                        color = Color(0x40000000),
                        offset = Offset(0f, 2f),
                        blurRadius = 4f
                    )
                )
            )

            Text(
                text = "We've sent a verification code to your email",
                fontSize = 16.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = 32.dp, vertical = 8.dp)
            )

            Spacer(modifier = Modifier.height(40.dp))

            // OTP Input Fields
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                otpDigits.forEachIndexed { index, digit ->
                    OtpDigitField(
                        value = digit,
                        isFocused = currentFocusIndex == index,
                        onValueChange = { newValue ->
                            if (newValue.length <= 1) {
                                val newOtpDigits = otpDigits.toMutableList()
                                newOtpDigits[index] = newValue
                                otpDigits = newOtpDigits
                                otp = newOtpDigits.joinToString("")

                                if (newValue.isNotEmpty() && index < 5) {
                                    currentFocusIndex = index + 1
                                }
                            }
                        },
                        onBackspace = {
                            if (digit.isEmpty() && index > 0) {
                                currentFocusIndex = index - 1
                            }
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Enhanced Verify Button
            Button(
                onClick = { viewModel.verifyMobileOTP(otp) },
                enabled = !authState.isLoading && otp.length == 6,
                modifier = Modifier
                    .fillMaxWidth(0.8f)
                    .height(56.dp)
                    .shadow(8.dp, RoundedCornerShape(16.dp))
                    .shimmerEffect(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary
                ),
                shape = RoundedCornerShape(16.dp)
            ) {
                AnimatedContent(
                    targetState = authState.isLoading,
                    label = "verify button content"
                ) { isLoading ->
                    if (isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            color = Color.White
                        )
                    } else {
                        Row(
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = Color.White
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                "Verify Code",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Resend Code Option
            TextButton(
                onClick = { /* TODO: Implement resend code */ },
                modifier = Modifier.padding(vertical = 8.dp)
            ) {
                Text(
                    buildAnnotatedString {
                        append("Didn't receive the code? ")
                        withStyle(
                            style = SpanStyle(
                                color = MaterialTheme.colorScheme.primary,
                                fontWeight = FontWeight.Bold
                            )
                        ) {
                            append("Resend")
                        }
                    }
                )
            }

            // Success or Error Messages with Animation
            AnimatedVisibility(
                visible = authState.verificationSuccess || authState.error != null,
                enter = fadeIn() + expandVertically(),
                exit = fadeOut() + shrinkVertically()
            ) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth(0.8f)
                        .padding(vertical = 16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (authState.verificationSuccess)
                            Color(0xFF4CAF50).copy(alpha = 0.1f)
                        else
                            MaterialTheme.colorScheme.error.copy(alpha = 0.1f)
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = if (authState.verificationSuccess)
                                Icons.Default.CheckCircle
                            else
                                Icons.Default.Error,
                            contentDescription = null,
                            tint = if (authState.verificationSuccess)
                                Color(0xFF4CAF50)
                            else
                                MaterialTheme.colorScheme.error,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = if (authState.verificationSuccess)
                                authState.verificationMessage ?: "Verification successful!"
                            else
                                authState.error ?: "Verification failed",
                            color = if (authState.verificationSuccess)
                                Color(0xFF4CAF50)
                            else
                                MaterialTheme.colorScheme.error
                        )
                    }
                }
            }
        }
    }

    LaunchedEffect(authState.verificationSuccess) {
        if (authState.verificationSuccess) {
            delay(1000) // Show success message briefly
            onVerificationComplete()
        }
    }
}

@Composable
private fun OtpDigitField(
    value: String,
    isFocused: Boolean,
    onValueChange: (String) -> Unit,
    onBackspace: () -> Unit
) {
    val borderColor by animateColorAsState(
        targetValue = if (isFocused)
            MaterialTheme.colorScheme.primary
        else
            MaterialTheme.colorScheme.outline.copy(alpha = 0.5f)
    )

    Box(
        modifier = Modifier
            .size(50.dp)
            .shadow(4.dp, RoundedCornerShape(12.dp))
            .background(Color.White, RoundedCornerShape(12.dp))
            .border(
                width = 2.dp,
                color = borderColor,
                shape = RoundedCornerShape(12.dp)
            ),
        contentAlignment = Alignment.Center
    ) {
        BasicTextField(
            value = value,
            onValueChange = { newValue ->
                if (newValue.isEmpty()) {
                    onValueChange("")
                    onBackspace()
                } else {
                    onValueChange(newValue.take(1))
                }
            },
            textStyle = TextStyle(
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colorScheme.onBackground
            ),
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Number
            ),
            singleLine = true,
            modifier = Modifier
                .fillMaxSize()
                .padding(2.dp),
            decorationBox = { innerTextField ->
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier.fillMaxSize()
                ) {
                    innerTextField()
                }
            }
        )
    }
}