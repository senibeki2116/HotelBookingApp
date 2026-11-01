const express = require("express");
const router = express.Router();

// =====================================================
// REVIEW CONTROLLER
// =====================================================

const {
  createReview,
  getHotelReviews,
  getMyReviews,
} = require("../controllers/reviewController");

// =====================================================
// AUTHENTICATION MIDDLEWARE
// =====================================================

const { protect } = require("../middleware/authMiddleware");

// =====================================================
// PUBLIC ROUTES
// =====================================================

// Get all reviews for a specific hotel
// GET /api/reviews/hotel/:hotelId
router.get("/hotel/:hotelId", getHotelReviews);

// =====================================================
// CUSTOMER PROTECTED ROUTES
// =====================================================

// Submit a hotel review
// POST /api/reviews
router.post("/", protect, createReview);

// Get reviews submitted by the logged-in customer
// GET /api/reviews/my
router.get("/my", protect, getMyReviews);

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;
