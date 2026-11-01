const mongoose = require("mongoose");

const Review = require("../models/Review");
const Hotel = require("../models/Hotel");
const Booking = require("../models/Booking");

// =====================================================
// CREATE HOTEL REVIEW
// Only customers with completed bookings can review.
// =====================================================

exports.createReview = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    const { hotelId, bookingId, rating, comment, images = [] } = req.body;

    // Check required fields
    if (!hotelId || !bookingId || rating === undefined || !comment) {
      return res.status(400).json({
        message: "Hotel, booking, rating and comment are required.",
      });
    }

    // Validate MongoDB IDs
    if (
      !mongoose.Types.ObjectId.isValid(hotelId) ||
      !mongoose.Types.ObjectId.isValid(bookingId)
    ) {
      return res.status(400).json({
        message: "Invalid hotel ID or booking ID.",
      });
    }

    // Validate rating
    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5.",
      });
    }

    // Validate comment
    const cleanComment = String(comment).trim();

    if (cleanComment.length < 5 || cleanComment.length > 1000) {
      return res.status(400).json({
        message: "Comment must contain between 5 and 1000 characters.",
      });
    }

    // Validate images
    if (!Array.isArray(images) || images.length > 5) {
      return res.status(400).json({
        message: "You can submit a maximum of 5 image URLs.",
      });
    }

    if (images.some((image) => typeof image !== "string" || !image.trim())) {
      return res.status(400).json({
        message: "Invalid image URL.",
      });
    }

    // Check hotel
    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found.",
      });
    }

    // Check completed booking belongs to this customer and hotel
    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId,
      hotel: hotelId,
      status: "confirmed",
      checkOut: { $lte: new Date() },
    });

    if (!booking) {
      return res.status(403).json({
        message:
          "You can only review a hotel after completing your confirmed stay.",
      });
    }

    // Prevent duplicate reviews
    const existingReview = await Review.findOne({
      booking: bookingId,
    });

    if (existingReview) {
      return res.status(409).json({
        message: "You have already reviewed this booking.",
      });
    }

    // Create review
    const review = await Review.create({
      hotel: hotelId,
      user: userId,
      booking: bookingId,
      rating: numericRating,
      comment: cleanComment,
      images: images.map((image) => image.trim()),
    });

    const populatedReview = await Review.findById(review._id)
      .populate("user", "name")
      .populate("hotel", "name");

    return res.status(201).json({
      message: "Review submitted successfully.",
      review: populatedReview,
    });
  } catch (error) {
    console.error("CREATE REVIEW ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already reviewed this booking.",
      });
    }

    return res.status(500).json({
      message: "Unable to submit review.",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL REVIEWS FOR A HOTEL
// =====================================================

exports.getHotelReviews = async (req, res) => {
  try {
    const { hotelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      return res.status(400).json({
        message: "Invalid hotel ID.",
      });
    }

    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found.",
      });
    }

    const reviews = await Review.find({ hotel: hotelId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews === 0
        ? 0
        : reviews.reduce((total, review) => {
            return total + review.rating;
          }, 0) / totalReviews;

    return res.status(200).json({
      hotelId,
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews,
      reviews,
    });
  } catch (error) {
    console.error("GET HOTEL REVIEWS ERROR:", error);

    return res.status(500).json({
      message: "Unable to retrieve hotel reviews.",
    });
  }
};

// =====================================================
// GET REVIEWS SUBMITTED BY LOGGED-IN CUSTOMER
// =====================================================

exports.getMyReviews = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    const reviews = await Review.find({ user: userId })
      .populate("hotel", "name location image")
      .populate("booking", "checkIn checkOut")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      totalReviews: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("GET MY REVIEWS ERROR:", error);

    return res.status(500).json({
      message: "Unable to retrieve your reviews.",
    });
  }
};
