plugins {
    alias(libs.plugins.androidApplication)
    alias(libs.plugins.jetbrainsKotlinAndroid)
    id("com.google.gms.google-services")
}

android {
    namespace = "com.example.neighbornet"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.neighbornet"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.1"
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
            // Add these lines to exclude problematic files
            excludes += "/META-INF/kotlin-stdlib-*.kotlin_module"
            excludes += "/META-INF/java.com.google.android.gms.libs.filecompliance.proto_file_access_api_type_kt_proto_lite.kotlin_module"
            excludes += "/META-INF/third_party.kotlin.protobuf.src.commonMain.kotlin.com.google.protobuf.kotlin_only_for_use_in_proto_generated_code_its_generator_and_tests.kotlin_module"
            excludes += "/META-INF/third_party.kotlin.protobuf.src.commonMain.kotlin.com.google.protobuf.kotlin_shared_runtime.kotlin_module"
        }
    }
}

dependencies {
    // Update Firebase BOM version
    implementation(platform("com.google.firebase:firebase-bom:32.7.0"))

    // Firebase dependencies (use BOM versions)
    implementation("com.google.firebase:firebase-analytics")
    implementation("com.google.firebase:firebase-auth-ktx")

    // Update Play Services Auth
    implementation("com.google.android.gms:play-services-auth:20.7.0")

    implementation("androidx.security:security-crypto:1.1.0-alpha06")
    implementation("androidx.lifecycle:lifecycle-viewmodel:2.6.2")
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.6.2")

    implementation("androidx.security:security-crypto-ktx:1.1.0-alpha06")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-play-services:1.7.1")


    // Compose BOM
    val composeBom = platform(libs.androidx.compose.bom)
    implementation(composeBom)
    androidTestImplementation(composeBom)

    // Rest of your dependencies remain the same
    implementation(libs.androidx.ui)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.ui.graphics)

    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.lifecycle.runtime.compose)

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)

    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(libs.androidx.ui.test.junit4)
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)

    implementation("com.auth0:java-jwt:4.4.0")

    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.retrofit2:converter-scalars:2.9.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.9.3")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.1")
}