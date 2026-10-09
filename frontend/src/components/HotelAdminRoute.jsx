import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const HotelAdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  // Wait until AuthContext restores the saved user.
  if (loading) {
    return (
      <div style={{ padding: "30px", textAlign: "center" }}>
        Checking authentication...
      </div>
    );
  }

  // Redirect only after authentication has finished loading.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "hoteladmin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default HotelAdminRoute;
