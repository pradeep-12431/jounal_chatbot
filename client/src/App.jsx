import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Journal from "./pages/Journal";
import Subscribe from "./pages/Subscribe";
// import AdminDashboard from "./pages/AdminDashboard"; // Removed: No longer a separate page

const App = () => {
  let isLoggedIn = false;
  let userId = null;

  const userString = localStorage.getItem("user");
  console.log("DEBUG App.js: Raw userString from localStorage:", userString);

  if (userString && userString.trim() !== "" && userString.trim().toLowerCase() !== "undefined") {
    try {
      const user = JSON.parse(userString);
      isLoggedIn = !!user;
      userId = user?._id;
      console.log("DEBUG App.js: Successfully parsed user:", user);
    } catch (e) {
      console.error("DEBUG App.js: Error parsing user from localStorage:", e);
      console.warn("DEBUG App.js: Clearing malformed 'user' data from localStorage.");
      localStorage.removeItem("user");
      isLoggedIn = false;
      userId = null;
    }
  } else {
    isLoggedIn = false;
    userId = null;
    if (userString !== null && userString.trim() !== "") {
      console.warn("DEBUG App.js: Clearing 'user' data from localStorage because it was 'undefined' string or empty.");
      localStorage.removeItem("user");
    }
  }

  console.log("DEBUG App.js: Final isLoggedIn status:", isLoggedIn);
  console.log("DEBUG App.js: Final userId:", userId);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={!isLoggedIn ? <Login /> : <Navigate to="/journal" replace />}
        />
        <Route
          path="/register"
          element={!isLoggedIn ? <Register /> : <Navigate to="/journal" replace />}
        />
        <Route
          path="/journal"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Journal />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route
          path="/subscribe"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Subscribe />
            </ProtectedRoute>
          }
        />
        {/* Removed: Admin Dashboard Route is no longer separate */}
        {/* <Route
          path="/admin"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        /> */}
      </Routes>
    </Router>
  );
};

export default App;