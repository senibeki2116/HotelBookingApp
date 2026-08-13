import { BrowserRouter, Routes, Route } from "react-router-dom";

// User Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

import Hotels from "./pages/Hotels";
import HotelDetails from "./pages/HotelDetails";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";

import ManageHotels from "./pages/ManageHotels";
import AdminHotels from "./pages/AdminHotels";
import AddHotel from "./pages/admin/AddHotel";
import EditHotel from "./pages/EditHotel";
import AdminBooking from "./pages/AdminBooking";
import AdminUsers from "./pages/AdminUsers";
import AdminReports from "./pages/AdminReports";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= USER PAGES ================= */}

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/hotels" element={<Hotels />} />

        {/* Hotel Details */}
        <Route path="/hotels/:id" element={<HotelDetails />} />

        {/* ================= BOOKING ================= */}

        <Route
          path="/booking/hotel/:id"
          element={
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          }
        />

        {/* My Bookings */}
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* ================= ADMIN ================= */}

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Alias for legacy navigation */}
        <Route
          path="/AdminDashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Admin Hotels */}
        <Route
          path="/admin/hotels"
          element={
            <AdminRoute>
              <AdminHotels />
            </AdminRoute>
          }
        />

        {/* Manage Hotels */}
        <Route
          path="/admin/manage-hotels"
          element={
            <AdminRoute>
              <ManageHotels />
            </AdminRoute>
          }
        />

        {/* Add Hotel */}
        <Route
          path="/admin/add-hotel"
          element={
            <AdminRoute>
              <AddHotel />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/hotels/add"
          element={
            <AdminRoute>
              <AddHotel />
            </AdminRoute>
          }
        />

        {/* Edit Hotel */}
        <Route
          path="/admin/hotels/edit/:id"
          element={
            <AdminRoute>
              <EditHotel />
            </AdminRoute>
          }
        />

        {/* Admin Bookings */}
        <Route
          path="/admin/bookings"
          element={
            <AdminRoute>
              <AdminBooking />
            </AdminRoute>
          }
        />

        {/* Admin Users */}
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />

        {/* Admin Reports */}
        <Route
          path="/admin/reports"
          element={
            <AdminRoute>
              <AdminReports />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
