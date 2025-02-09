import SignIn from "./components/SplashScreen/SignIn"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./backendApi/AuthContext"
import Homepage from "./components/HomePage"
import ProtectedRoute from "./components/ProtectedRoute"
import VerifyEmail from "./components/SplashScreen/VerifyEmail"
import { NotificationProvider } from "./backendApi/NotificationContext"
import AboutUs from "./components/AboutUs"
import ScrollToTop from "./components/SplashScreen/ScrolltoTop"
import OAuth2RedirectHandler from "./auth/OAuth2RedirectHandler"

function App() {
  return (
    <NotificationProvider>
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
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
