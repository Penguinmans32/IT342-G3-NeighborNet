import SignIn from "./components/SplashScreen/SignIn"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./backendApi/AuthContext"
import Homepage from "./components/HomePage"
import ProtectedRoute from "./components/ProtectedRoute"
import VerifyEmail from "./components/SplashScreen/VerifyEmail"
import { NotificationProvider } from "./backendApi/NotificationContext"

function App() {
  return (
    <NotificationProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route 
            path="/homepage" 
            element={
              <ProtectedRoute>
                <Homepage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </NotificationProvider>
  )
}

export default App
