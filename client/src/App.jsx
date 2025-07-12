import React, { useState, useEffect } from "react"; // <--- Add useState and useEffect
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Journal from "./pages/Journal";
import Subscribe from "./pages/Subscribe";

const App = () => {
  // ⭐ CHANGE THESE TO useState HOOKS ⭐
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  // ⭐ ADD A useEffect TO INITIALIZE STATE FROM localStorage ⭐
  useEffect(() => {
    const userString = localStorage.getItem("user");
    // console.log("DEBUG App.js: Raw userString from localStorage (useEffect):", userString); // For debugging

    if (userString && userString.trim() !== "" && userString.trim().toLowerCase() !== "undefined") {
      try {
        const user = JSON.parse(userString);
        setIsLoggedIn(!!user); // Update the state
        setUserId(user?._id); // Update the state
        // console.log("DEBUG App.js: Successfully parsed user (useEffect):", user); // For debugging
      } catch (e) {
        // console.error("DEBUG App.js: Error parsing user from localStorage (useEffect):", e); // For debugging
        // console.warn("DEBUG App.js: Clearing malformed 'user' data from localStorage (useEffect)."); // For debugging
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        setUserId(null);
      }
    } else {
      setIsLoggedIn(false);
      setUserId(null);
      if (userString !== null && userString.trim() !== "") {
        // console.warn("DEBUG App.js: Clearing 'user' data from localStorage because it was 'undefined' string or empty (useEffect)."); // For debugging
        localStorage.removeItem("user");
      }
    }
  }, []); // The empty dependency array means this useEffect runs only once after the initial render

  // console.log("DEBUG App.js: Final isLoggedIn status (render):", isLoggedIn); // For debugging
  // console.log("DEBUG App.js: Final userId (render):", userId); // For debugging

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
            <ProtectedRoute isLoggedIn={isLoggedIn}> {/* Pass the state variable */}
              <Journal />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route
          path="/subscribe"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}> {/* Pass the state variable */}
              <Subscribe />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;