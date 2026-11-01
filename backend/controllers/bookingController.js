const Hotel = require("../models/Hotel");
const Booking = require("../models/Booking");

// =========================================================
// CREATE BOOKING
// =========================================================
exports.createBooking = async (req, res) => {
  try {
    const { hotelId, checkIn, checkOut, guests, rooms } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!hotelId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: "Hotel, check-in date and check-out date are required.",
      });
    }

    const guestCount = Number(guests);
    const roomCount = Number(rooms);

    if (!Number.isInteger(guestCount) || guestCount < 1) {
      return res.status(400).json({
        success: false,
        message: "Guests must be at least 1.",
      });
    }

    if (!Number.isInteger(roomCount) || roomCount < 1) {
      return res.status(400).json({
        success: false,
        message: "Rooms must be at least 1.",
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (
      Number.isNaN(checkInDate.getTime()) ||
      Number.isNaN(checkOutDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking dates.",
      });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: "Check-out date must be after check-in date.",
      });
    }

    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    const availableRooms = Number(hotel.rooms) || 0;

    if (roomCount > availableRooms) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableRooms} room${
          availableRooms === 1 ? "" : "s"
        } available.`,
      });
    }

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const nights = Math.ceil((checkOutDate - checkInDate) / millisecondsPerDay);

    if (nights < 1) {
      return res.status(400).json({
        success: false,
        message: "Booking must be at least one night.",
      });
    }

    const pricePerNight = Number(hotel.price) || 0;
    const totalPrice = pricePerNight * nights * roomCount;

    const booking = await Booking.create({
      user: userId,
      hotel: hotel._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: guestCount,
      rooms: roomCount,
      totalPrice,
      status: "confirmed",
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate("user", "name email")
      .populate("hotel", "name location price image");

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: populatedBooking,
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
    console.error("CREATE BOOKING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to create booking.",
    });
  }
};

// =========================================================
// GET LOGGED-IN USER BOOKINGS
// =========================================================
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const bookings = await Booking.find({ user: userId })
      .populate("hotel")
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("GET MY BOOKINGS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to get bookings.",
    });
  }
};

// =========================================================
// GET SINGLE BOOKING
// =========================================================
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("hotel")
      .populate("user", "name email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const userId = req.user?._id || req.user?.id;
    const role = req.user?.role;

    // Customers can access only their own bookings.
    // Admins can access bookings across the platform.
    // Hotel admins can access only bookings for their own hotel.
    if (role === "hoteladmin" || role === "hotelAdmin") {
      const hotel = await Hotel.findOne({
        hotelAdmin: userId,
      });

      if (!hotel || booking.hotel?._id?.toString() !== hotel._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to view this booking.",
        });
      }
    } else if (
      role !== "admin" &&
      (!userId || booking.user?._id?.toString() !== userId.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this booking.",
      });
    }

    return res.status(200).json(booking);
  } catch (error) {
    console.error("GET BOOKING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to get booking.",
    });
  }
};

// =========================================================
// DELETE / CANCEL BOOKING
// =========================================================
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const userId = req.user?._id || req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (booking.user.toString() !== userId.toString() && role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this booking",
      });
    }

    await booking.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("DELETE BOOKING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to cancel booking.",
    });
  }
};

// =========================================================
// GET ALL BOOKINGS
// =========================================================
exports.getAllBookings = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("hotel", "name location price image")
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("GET ALL BOOKINGS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to get all bookings.",
    });
  }
};

// =========================================================
// GET BOOKINGS FOR HOTEL ADMIN'S HOTEL
// =========================================================
exports.getMyHotelBookings = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    console.log("\n=================================");
    console.log("GET HOTEL ADMIN BOOKINGS STARTED");
    console.log("USER ID:", userId);
    console.log("USER ROLE:", req.user?.role);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find the hotel assigned to this hotel administrator.
    const hotel = await Hotel.findOne({
      hotelAdmin: userId,
    });

    if (!hotel) {
      console.log("NO HOTEL FOUND FOR USER:", userId);

      return res.status(404).json({
        success: false,
        message: "No hotel is assigned to this hotel admin",
      });
    }

    console.log("HOTEL FOUND:", hotel.name);
    console.log("HOTEL ID:", hotel._id);

    // Find all bookings belonging to this hotel.
    const bookings = await Booking.find({
      hotel: hotel._id,
    })
      .populate("user", "name email")
      .populate("hotel", "name location price image")
      .sort({ createdAt: -1 })
      .lean();

    console.log("TOTAL BOOKINGS FOUND:", bookings.length);
    console.log(
      "BOOKING IDS:",
      bookings.map((booking) => booking._id),
    );

    console.log("GET HOTEL ADMIN BOOKINGS COMPLETED");
    console.log("=================================\n");

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("GET HOTEL ADMIN BOOKINGS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to get hotel bookings",
    });
  }
};

// =========================================================
// UPDATE BOOKING STATUS
// HOTEL ADMIN
// =========================================================
exports.updateBookingStatus = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { status } = req.body;

    if (!["confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status.",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const hotel = await Hotel.findOne({
      hotelAdmin: userId,
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "No hotel is assigned to this hotel admin",
      });
    }

    // Ensure the booking belongs to this hotel admin's hotel.
    if (booking.hotel.toString() !== hotel._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to manage this booking.",
      });
    }

    booking.status = status;
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate("user", "name email")
      .populate("hotel", "name location price image");

    return res.status(200).json({
      success: true,
      message: `Booking ${status} successfully`,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("UPDATE BOOKING STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to update booking status.",
    });
  }
};
