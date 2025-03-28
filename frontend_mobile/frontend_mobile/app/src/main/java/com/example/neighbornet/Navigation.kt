package com.example.neighbornet

sealed class Screen(val route: String) {
    object Home : Screen("home")
    object ClassDetails : Screen("class/{classId}") {
        fun createRoute(classId: Long) = "class/$classId"
    }

    object AddItem : Screen("add_item")
    object Lesson : Screen("lesson/{classId}/{lessonId}") {
        fun createRoute(classId: Long, lessonId: Long) = "lesson/$classId/$lessonId"
    }

    object ItemDetails : Screen("item_details/{itemId}") {
        fun createRoute(itemId: Long) = "item_details/$itemId"
    }

    object Categories : Screen("categories")

    object Chat : Screen("chat/{userId}/{username}") {
        fun createRoute(userId: Long, username: String) = "chat/$userId/$username"
    }
    object Profile : Screen("profile")
}
