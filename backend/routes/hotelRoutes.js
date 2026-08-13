const express = require("express");
const router = express.Router();

const {
  createHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
} = require("../controllers/hotelController");

const { protect } = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// Public routes
router.get("/", getHotels);

router.get("/:id", getHotelById);

// Admin routes
router.post("/", protect, admin, createHotel);

router.put("/:id", protect, admin, updateHotel);

router.delete("/:id", protect, admin, deleteHotel);

module.exports = router;
