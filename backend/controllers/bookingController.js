const Hotel = require("../models/Hotel");
const Booking = require("../models/Booking");

// ==========================
// Create Booking
// ==========================
exports.createBooking = async (req, res) => {
  try {
    const { hotelId, checkIn, checkOut, guests } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Check if hotel exists
    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found",
      });
    }

    // Create booking
    const booking = await Booking.create({
      user: userId,
      hotel: hotelId,
      checkIn,
      checkOut,
      guests,
      totalPrice: hotel.price * guests,
    });

    res.status(201).json({
      message: "Booking created",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// Get Logged-in User Bookings
// ==========================
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    const bookings = await Booking.find({
      user: userId,
    }).populate("hotel");

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// Get Single Booking
// ==========================
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("hotel")
      .populate("user", "name email");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// Delete Booking
// ==========================
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // Check if the booking belongs to the logged-in user
    const userId = req.user?.id || req.user?._id;
    if (booking.user.toString() !== userId.toString()) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    await booking.deleteOne();

    res.status(200).json({
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// ==========================
// Get All Bookings - Admin
// ==========================
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("hotel", "name location price image")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Get all bookings error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};
