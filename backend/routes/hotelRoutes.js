const express = require("express");

const router = express.Router();

const {
  createHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
  assignHotelAdmin,
} = require("../controllers/hotelController");

const { protect } = require("../middleware/authMiddleware");

const admin = require("../middleware/adminMiddleware");

// Public routes

router.get("/", getHotels);

router.get("/:id", getHotelById);

// Super Admin routes

router.post("/", protect, admin, createHotel);

router.put("/:id", protect, admin, updateHotel);

router.delete("/:id", protect, admin, deleteHotel);

// Assign a Hotel Admin to a specific hotel
router.put("/:id/assign-admin", protect, admin, assignHotelAdmin);

module.exports = router;
