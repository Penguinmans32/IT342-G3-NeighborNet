package com.example.neighbornet

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Devices
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.neighbornet.ui.theme.NeighbornetTheme
import kotlinx.coroutines.delay

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            NeighbornetTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    LandingPage()
                }
            }
        }
    }
}

@Composable
fun LandingPage(isPreview: Boolean = false) {
    // For preview, we'll show everything immediately
    var isVisible by remember { mutableStateOf(isPreview) }
    var isDescriptionVisible by remember { mutableStateOf(isPreview) }

    // Only trigger animations if not in preview
    if (!isPreview) {
        LaunchedEffect(Unit) {
            delay(300)
            isVisible = true
            delay(300)
            isDescriptionVisible = true
        }
    }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = Color(0xFFFFFFFF) // Explicit white background
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            Spacer(modifier = Modifier.height(48.dp))

            // Logo
            if (isPreview || isVisible) {
                LogoContainer()
            }

            // Title
            if (isPreview || isVisible) {
                BrandTitle()
            }

            // Description
            if (isPreview || isDescriptionVisible) {
                Description()
            }

            Spacer(modifier = Modifier.weight(1f))

            // Button
            if (isPreview || isDescriptionVisible) {
                ContinueButton()
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

@Composable
fun LogoContainer() {
    Surface(
        modifier = Modifier.size(200.dp),
        shape = RoundedCornerShape(28.dp),
        color = MaterialTheme.colorScheme.surface,
        tonalElevation = 8.dp
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.linearGradient(
                        listOf(
                            Color(0xFF6200EE),
                            Color(0xFF3700B3)
                        )
                    )
                ),
            contentAlignment = Alignment.Center
        ) {
            // Placeholder text for preview
            Text(
                text = "LOGO",
                color = Color.White,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
fun BrandTitle() {
    Text(
        text = "NeighborNet",
        fontSize = 40.sp,
        fontWeight = FontWeight.ExtraBold,
        color = Color.Black,
        style = MaterialTheme.typography.headlineLarge.copy(
            letterSpacing = (-1).sp
        )
    )
}

@Composable
fun Description() {
    Text(
        text = "Connect with your neighbors, share resources, and build a stronger community together",
        fontSize = 18.sp,
        textAlign = TextAlign.Center,
        color = Color.Black.copy(alpha = 0.8f),
        modifier = Modifier.padding(horizontal = 16.dp),
        style = MaterialTheme.typography.bodyLarge,
        lineHeight = 28.sp,
        fontWeight = FontWeight.Medium
    )
}

@Composable
fun ContinueButton() {
    Button(
        onClick = { /* TODO: Navigation */ },
        modifier = Modifier
            .fillMaxWidth()
            .height(60.dp)
            .clip(RoundedCornerShape(16.dp)),
        colors = ButtonDefaults.buttonColors(
            containerColor = Color(0xFF6200EE),
            contentColor = Color.White
        ),
        elevation = ButtonDefaults.buttonElevation(
            defaultElevation = 4.dp,
            pressedElevation = 8.dp,
            hoveredElevation = 6.dp
        )
    ) {
        Text(
            text = "Get Started",
            fontSize = 20.sp,
            fontWeight = FontWeight.SemiBold
        )
    }
}

@Preview(
    name = "Landing Page",
    device = Devices.PIXEL_4,
    showBackground = true,
    showSystemUi = true
)
@Composable
fun LandingPagePreview() {
    NeighbornetTheme {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background
        ) {
            LandingPage(isPreview = true)
        }
    }
}