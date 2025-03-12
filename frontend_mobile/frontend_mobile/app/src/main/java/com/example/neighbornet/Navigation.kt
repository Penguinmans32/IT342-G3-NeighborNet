package com.example.neighbornet

sealed class Screen(val route: String) {
    object Home : Screen("home")
    object ClassDetails : Screen("class/{classId}") {
        fun createRoute(classId: Long) = "class/$classId"
    }
    object Categories : Screen("categories")
    object Chat : Screen("chat")
    object Profile : Screen("profile")
}
