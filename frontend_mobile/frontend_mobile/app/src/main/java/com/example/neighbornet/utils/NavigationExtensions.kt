package com.example.neighbornet.utils

import androidx.compose.runtime.CompositionLocalProvider
import androidx.lifecycle.ViewModelStoreOwner
import androidx.compose.runtime.remember
import androidx.lifecycle.viewmodel.compose.LocalViewModelStoreOwner
import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.example.neighbornet.Screen

fun NavGraphBuilder.chatGraph(
    navController: NavHostController,
    viewModelStoreOwner: ViewModelStoreOwner
) {
    composable(Screen.Chat.route) {
        CompositionLocalProvider(LocalViewModelStoreOwner provides viewModelStoreOwner) {
            ChatListScreen(
                onChatSelected = { userId, userName ->
                    navController.navigate(Screen.ChatDetail.createRoute(userId, userName))
                }
            )
        }
    }

    composable(
        route = Screen.ChatDetail.route,
        arguments = listOf(
            navArgument("userId") { type = NavType.LongType },
            navArgument("userName") { type = NavType.StringType }
        )
    ) { backStackEntry ->
        CompositionLocalProvider(LocalViewModelStoreOwner provides viewModelStoreOwner) {
            val userId = backStackEntry.arguments?.getLong("userId") ?: return@CompositionLocalProvider
            val userName = backStackEntry.arguments?.getString("userName") ?: return@CompositionLocalProvider

            ChatScreen(
                userId = userId,
                userName = userName,
                onBackClick = { navController.navigateUp() }
            )
        }
    }
}