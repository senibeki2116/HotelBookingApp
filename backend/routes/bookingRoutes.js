const express = require("express");

const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getBookingById,
  deleteBooking,
  getAllBookings,
  getMyHotelBookings,
  updateBookingStatus,
} = require("../controllers/bookingController");

const { protect } = require("../middleware/authMiddleware");
const hotelAdmin = require("../middleware/hotelAdminMiddleware");

// =====================================================
// CUSTOMER - CREATE BOOKING
// =====================================================

router.post("/", protect, createBooking);

// =====================================================
// ADMIN - ALL BOOKINGS
// =====================================================

router.get("/", protect, getAllBookings);

// =====================================================
// CUSTOMER - MY BOOKINGS
// =====================================================

router.get("/my", protect, getMyBookings);

// =====================================================
// HOTEL ADMIN - MY HOTEL BOOKINGS
// =====================================================

router.get("/my-hotel", protect, hotelAdmin, getMyHotelBookings);

// =====================================================
// SINGLE BOOKING
// =====================================================

// =====================================================
// HOTEL ADMIN - UPDATE BOOKING STATUS
// =====================================================

router.patch("/:id/status", protect, hotelAdmin, updateBookingStatus);

router.get("/:id", protect, getBookingById);

// =====================================================
// DELETE BOOKING
// =====================================================

router.delete("/:id", protect, deleteBooking);

module.exports = router;
