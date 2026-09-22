const Hotel = require("../models/Hotel");
const Booking = require("../models/Booking");

// ==========================
// Create Booking
// ==========================
exports.createBooking = async (req, res) => {
  try {
    const { hotelId, checkIn, checkOut, guests, rooms } = req.body;

    const userId = req.user?._id || req.user?.id;

    // ==========================
    // Authentication
    // ==========================

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // ==========================
    // Validation
    // ==========================

    if (!hotelId || !checkIn || !checkOut) {
      return res.status(400).json({
        message: "Hotel, check-in date and check-out date are required.",
      });
    }

    const guestCount = Number(guests);
    const roomCount = Number(rooms);

    if (!Number.isInteger(guestCount) || guestCount < 1) {
      return res.status(400).json({
        message: "Guests must be at least 1.",
      });
    }

    if (!Number.isInteger(roomCount) || roomCount < 1) {
      return res.status(400).json({
        message: "Rooms must be at least 1.",
      });
    }

    // ==========================
    // Dates
    // ==========================

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (Number.isNaN(checkInDate.getTime())) {
      return res.status(400).json({
        message: "Invalid check-in date.",
      });
    }

    if (Number.isNaN(checkOutDate.getTime())) {
      return res.status(400).json({
        message: "Invalid check-out date.",
      });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        message: "Check-out date must be after check-in date.",
      });
    }

    // ==========================
    // Find Hotel
    // ==========================

    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found",
      });
    }

    // ==========================
    // Check Available Rooms
    // ==========================

    const availableRooms = Number(hotel.rooms) || 0;

    if (roomCount > availableRooms) {
      return res.status(400).json({
        message: `Only ${availableRooms} room${
          availableRooms === 1 ? "" : "s"
        } available.`,
      });
    }

    // ==========================
    // Calculate Nights
    // ==========================

    const millisecondsPerDay = 1000 * 60 * 60 * 24;

    const nights = Math.ceil((checkOutDate - checkInDate) / millisecondsPerDay);

    if (nights < 1) {
      return res.status(400).json({
        message: "Booking must be at least one night.",
      });
    }

    // ==========================
    // Calculate Price
    // ==========================

    const pricePerNight = Number(hotel.price) || 0;

    const totalPrice = pricePerNight * nights * roomCount;

    // ==========================
    // Create Booking
    // ==========================

    const booking = await Booking.create({
      user: userId,
      hotel: hotelId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: guestCount,
      rooms: roomCount,
      totalPrice,
      status: "confirmed",
    });

    // ==========================
    // Response
    // ==========================

    res.status(201).json({
      message: "Booking created successfully",

      booking,

      summary: {
        hotel: hotel.name,
        pricePerNight,
        nights,
        guests: guestCount,
        rooms: roomCount,
        totalPrice,
      },
    });
  } catch (error) {
    console.error("Create booking error:", error);

    res.status(500).json({
      message: error.message || "Unable to create booking.",
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
// ==========================
// Get Bookings for Hotel Admin's Hotel
// ==========================
exports.getMyHotelBookings = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const hotel = await Hotel.findOne({
      hotelAdmin: userId,
    });

    if (!hotel) {
      return res.status(404).json({
        message: "No hotel is assigned to this hotel admin",
      });
    }

    const bookings = await Booking.find({
      hotel: hotel._id,
    })
      .populate("user", "name email")
      .populate("hotel", "name location price image")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Get hotel admin bookings error:", error);

    res.status(500).json({
      message: error.message || "Unable to get hotel bookings",
    });
  }
};
