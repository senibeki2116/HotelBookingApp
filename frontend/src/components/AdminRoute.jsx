import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  // User is not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Allow both admin and hoteladmin
  const role = String(user.role || "")
    .trim()
    .toLowerCase();

  if (role !== "admin" && role !== "hoteladmin") {
    return <Navigate to="/" replace />;
  }

  // Admin or hotel admin
  return children;
};

export default AdminRoute;
