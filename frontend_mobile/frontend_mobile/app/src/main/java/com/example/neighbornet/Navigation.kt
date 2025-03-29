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

    object Chat : Screen("chat")
    object ChatDetail : Screen("chat/{userId}/{userName}") {
        fun createRoute(userId: Long, userName: String) = "chat/$userId/$userName"
    }
    object Profile : Screen("profile")
}