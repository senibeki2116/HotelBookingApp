import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  // User is not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is logged in but is not an admin
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // User is an admin
  return children;
};

export default AdminRoute;
