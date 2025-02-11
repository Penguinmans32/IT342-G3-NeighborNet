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
import { AuthProviderWithErrorBoundary } from "./backendApi/AuthContext"
import ClassDetails from "./components/SplashScreen/ClassDetails"
import CreateClass from "./components/SplashScreen/CreateClass"
import YourClasses from "./components/SplashScreen/YourClasses"

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AuthProviderWithErrorBoundary>
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
            <Route 
              path="/class/:id"
              element={
                <ProtectedRoute>
                  <ClassDetails />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/create-class"
              element={
                <ProtectedRoute>
                  <CreateClass />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/your-classes"
              element={
                <ProtectedRoute>
                  <YourClasses />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProviderWithErrorBoundary>
      </NotificationProvider>
    </BrowserRouter>
  )
}
export default App