import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Index";
import Footer from "./components/Footer";
import NavBar from "./components/NavBar";
import About from "./pages/About/Index";
import Dashboard from "./pages/Dashboard/Index";
import CourseDetails from "./CourseDetails/Index";
import { ProtectedRoute } from "./components/Protected";
import SignUp from "./pages/Authentication/Signup";
import SignIn from "./pages/Authentication/Login";
import Contact from "./pages/Contact/Index";
import CourseManagement from "./components/CourseManagement";
import SubscriptionRequests from "./pages/SubscriptionRequests";
import "react-toastify/dist/ReactToastify.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <NavBar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
           <Route path="/course/:slug" element={<CourseDetails />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/course-management"
              element={
                <ProtectedRoute>
                  <CourseManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscription-requests"
              element={
                <ProtectedRoute>
                  <SubscriptionRequests />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
