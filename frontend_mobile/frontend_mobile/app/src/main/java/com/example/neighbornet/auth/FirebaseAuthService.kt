package com.example.neighbornet.auth

import android.app.Activity
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.auth.OAuthProvider
import kotlinx.coroutines.tasks.await
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import javax.inject.Inject
import javax.inject.Singleton


@Singleton
class FirebaseAuthService @Inject constructor() {
    private val auth: FirebaseAuth = FirebaseAuth.getInstance()

    suspend fun signInWithGoogle(account: GoogleSignInAccount): FirebaseUser? {
        val credential = GoogleAuthProvider.getCredential(account.idToken, null)
        return try {
            val result = auth.signInWithCredential(credential).await()
            result.user
        } catch (e: Exception) {
            throw Exception("Google sign in failed: ${e.message}")
        }
    }

    suspend fun signInWithGitHub(activity: Activity): FirebaseUser? {
        val provider = OAuthProvider.newBuilder("github.com")
        return try {
            val result = auth.startActivityForSignInWithProvider(activity, provider.build()).await()
            result.user
        } catch (e: Exception) {
            throw Exception("GitHub sign in failed: ${e.message}")
        }
    }

    suspend fun signInWithMicrosoft(activity: Activity): FirebaseUser? {
        val provider = OAuthProvider.newBuilder("microsoft.com")
        return try {
            val result = auth.startActivityForSignInWithProvider(activity, provider.build()).await()
            result.user
        } catch (e: Exception) {
            throw Exception("Microsoft sign in failed: ${e.message}")
        }
    }

    fun signOut() {
        auth.signOut()
    }
}