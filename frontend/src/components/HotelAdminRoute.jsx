import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const HotelAdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "hoteladmin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default HotelAdminRoute;
