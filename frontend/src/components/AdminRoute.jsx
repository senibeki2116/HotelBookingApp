import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  // User is not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = String(user.role || "")
    .trim()
    .toLowerCase();

  if (role === "hoteladmin") {
    return <Navigate to="/admin/hotel-dashboard" replace />;
  }

  if (role !== "admin" && role !== "superadmin") {
    return <Navigate to="/" replace />;
  }

  // Platform administrators only
  return children;
};

export default AdminRoute;
