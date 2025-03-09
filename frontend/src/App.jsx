import SignIn from "./components/SplashScreen/SignIn";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProviderWithErrorBoundary } from "./backendApi/AuthContext";
import Homepage from "./components/HomePage";
import ProtectedRoute from "./components/ProtectedRoute";
import VerifyEmail from "./components/SplashScreen/VerifyEmail";
import { NotificationProvider } from "./backendApi/NotificationContext";
import AboutUs from "./components/AboutUs";
import ScrollToTop from "./components/SplashScreen/ScrolltoTop";
import OAuth2RedirectHandler from "./auth/OAuth2RedirectHandler";
import ClassDetails from "./components/SplashScreen/ClassDetails";
import CreateClass from "./components/SplashScreen/CreateClass";
import YourClasses from "./components/SplashScreen/YourClasses";
import LessonView from "./components/SplashScreen/LessonView";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
import { Toaster } from 'react-hot-toast';
import EditClass from "./components/SplashScreen/EditClass";
import Borrowing from "./components/Borrowing";
import AddBorrowingItem from "./components/AddBorrowingItem";
import ItemDetail from "./components/ItemDetail";
import MessagesPage from "./components/MessagesPage";
import YourItems from "./components/YourItems";
import BorrowedItems from "./components/BorrowedItems";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <Router>
        <AuthProviderWithErrorBoundary>
          <NotificationProvider>
          <ScrollToTop />
          <Toaster
              position="top-center"
              reverseOrder={false}
              toastOptions={{
                style: {
                  zIndex: 9999,
                },
              }}
            />
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
              path="/class/:classId"
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
            <Route 
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
             <Route 
              path="/your-classes/:classId/lessons/:lessonId" 
              element={
                <ProtectedRoute>
                  <LessonView />
                </ProtectedRoute>
              } 
            />
            <Route 
            path="/class/:classId/edit"
            element={
              <ProtectedRoute>
              <EditClass />
              </ProtectedRoute>
            } 
            />
            <Route 
              path="/edit-profile"
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/borrowing"
              element={
                <ProtectedRoute>
                  <Borrowing />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/borrowing/add-item"
              element={
                <ProtectedRoute>
                  <AddBorrowingItem />
                </ProtectedRoute>
              } 
            />
             <Route 
              path="/borrowing/item/:id"
              element={
                <ProtectedRoute>
                  <ItemDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/messages"
              element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/your-items"
              element={
                <ProtectedRoute>
                  <YourItems />
                </ProtectedRoute>
              } 
            />
             <Route 
              path="/borrowed-items"
              element={
                <ProtectedRoute>
                  <BorrowedItems />
                </ProtectedRoute>
              } 
            />
             <Route 
              path="/community"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
          </NotificationProvider>
        </AuthProviderWithErrorBoundary>
    </Router>
  );
}

export default App;
