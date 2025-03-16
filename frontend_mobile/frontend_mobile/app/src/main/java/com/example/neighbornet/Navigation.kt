package com.example.neighbornet

sealed class Screen(val route: String) {
    object Home : Screen("home")
    object ClassDetails : Screen("class/{classId}") {
        fun createRoute(classId: Long) = "class/$classId"
    }
    object Lesson : Screen("lesson/{classId}/{lessonId}") {
        fun createRoute(classId: Long, lessonId: Long) = "lesson/$classId/$lessonId"
    }
    object Categories : Screen("categories")
    object Chat : Screen("chat")
    object Profile : Screen("profile")
}
