import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Journal from "./pages/Journal";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <Router>
      <nav>
        {user ? (
          <>
            <Link to="/journal">Journal</Link>{" "}
            <button
              onClick={() => {
                localStorage.removeItem("user");
                setUser(null);
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link> |{" "}
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>

      <Routes>
        <Route
          path="/"
          element={<Navigate to={user ? "/journal" : "/login"} />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/journal"
          element={user ? <Journal /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<h2>404: Not Found</h2>} />
      </Routes>
    </Router>
  );
}

export default App;
