const express = require("express");

const router = express.Router();

const {
  getHotels,
  getHotelById,
  createHotel,
  getMyHotel,
  updateHotel,
  updateMyHotel,
  deleteHotel,
} = require("../controllers/hotelController");

const { protect } = require("../middleware/authMiddleware");

// ======================================================
// ROLE MIDDLEWARE
// ======================================================
const adminOrHotelAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Not authenticated",
    });
  }

  if (req.user.role !== "admin" && req.user.role !== "hoteladmin") {
    return res.status(403).json({
      message: "Admin or hotel admin access required",
    });
  }

  next();
};

// ======================================================
// PUBLIC ROUTES
// ======================================================

// Get all hotels
router.get("/", getHotels);

// Get one hotel
router.get("/:id", getHotelById);

// ======================================================
// HOTEL ADMIN ROUTES
// ======================================================

// Get hotel belonging to logged-in hotel admin
router.get("/my-hotel", protect, getMyHotel);

// Create hotel
// ADMIN + HOTEL ADMIN
router.post("/", protect, adminOrHotelAdmin, createHotel);

// Update my hotel
router.put("/my-hotel", protect, adminOrHotelAdmin, updateMyHotel);

// ======================================================
// GENERAL HOTEL MANAGEMENT
// ======================================================

router.put("/:id", protect, adminOrHotelAdmin, updateHotel);

router.delete("/:id", protect, adminOrHotelAdmin, deleteHotel);

module.exports = router;
