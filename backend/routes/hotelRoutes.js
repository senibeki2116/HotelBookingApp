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

  const role = String(req.user.role || "")
    .trim()
    .toLowerCase();

  if (role !== "admin" && role !== "hoteladmin") {
    return res.status(403).json({
      message: "Admin or hotel admin access required",
      currentRole: req.user.role,
    });
  }

  next();
};

// ======================================================
// PUBLIC ROUTES
// ======================================================

// Get all hotels
router.get("/", getHotels);

// ======================================================
// HOTEL ADMIN ROUTES
// IMPORTANT:
// These routes MUST come before /:id
// ======================================================

// Get hotel belonging to logged-in hotel admin
router.get(
  "/my-hotel",
  (req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  },
  protect,
  getMyHotel,
);

// Update hotel belonging to logged-in hotel admin
router.put("/my-hotel", protect, adminOrHotelAdmin, updateMyHotel);

// ======================================================
// GENERAL HOTEL MANAGEMENT
// ======================================================

// Get one hotel by ID
// Keep this AFTER /my-hotel
router.get("/:id", getHotelById);

// Create hotel
router.post("/", protect, adminOrHotelAdmin, createHotel);

// Update any hotel
router.put("/:id", protect, adminOrHotelAdmin, updateHotel);

// Delete any hotel
router.delete("/:id", protect, adminOrHotelAdmin, deleteHotel);

module.exports = router;
