import { BrowserRouter, Routes, Route } from "react-router-dom";

// ================= USER PAGES =================
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

import Hotels from "./pages/Hotels";
import HotelDetails from "./pages/HotelDetails";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";

// ================= ADMIN PAGES =================
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";

import ManageHotels from "./pages/ManageHotels";
import AdminHotels from "./pages/AdminHotels";
import AddHotel from "./pages/AddHotel";
import EditHotel from "./pages/EditHotel";
import AdminBooking from "./pages/AdminBooking";
import AdminUsers from "./pages/AdminUsers";
import AdminReports from "./pages/AdminReports";

// ================= COMPONENTS =================
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =========================================
            USER PAGES
        ========================================= */}

        {/* Home */}
        <Route path="/" element={<Hotels />} />

        {/* Hotels */}
        <Route path="/hotels" element={<Hotels />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Register */}
        <Route path="/register" element={<Register />} />

        {/* Hotel Details */}
        <Route path="/hotels/:id" element={<HotelDetails />} />

        {/* =========================================
            BOOKING
        ========================================= */}

        <Route
          path="/booking/hotel/:id"
          element={
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            MY BOOKINGS
        ========================================= */}

        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        {/* 
          Compatibility route.

          If an old link somewhere in the project
          still uses /bookings, it will now work too.
        */}
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            PROFILE
        ========================================= */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            ADMIN DASHBOARD
        ========================================= */}

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

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

        {/* =========================================
            ADMIN HOTELS
        ========================================= */}

        <Route
          path="/admin/hotels"
          element={
            <AdminRoute>
              <AdminHotels />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/manage-hotels"
          element={
            <AdminRoute>
              <ManageHotels />
            </AdminRoute>
          }
        />

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

        <Route
          path="/admin/hotels/edit/:id"
          element={
            <AdminRoute>
              <EditHotel />
            </AdminRoute>
          }
        />

        {/* =========================================
            ADMIN BOOKINGS
        ========================================= */}

        <Route
          path="/admin/bookings"
          element={
            <AdminRoute>
              <AdminBooking />
            </AdminRoute>
          }
        />

        {/* =========================================
            ADMIN USERS
        ========================================= */}

        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />

        {/* =========================================
            ADMIN REPORTS
        ========================================= */}

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
