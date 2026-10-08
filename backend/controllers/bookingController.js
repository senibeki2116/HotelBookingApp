const Hotel = require("../models/Hotel");
const Booking = require("../models/Booking");

// =========================================================
// CREATE BOOKING
// =========================================================

exports.createBooking = async (req, res) => {
  try {
    console.log("\n=================================");
    console.log("CREATE BOOKING");
    console.log("USER:", req.user);

    const { hotelId, checkIn, checkOut, guests, rooms } = req.body;

    const userId = req.user?._id || req.user?.id;

    // ==========================
    // Authentication
    // ==========================

    if (!userId) {
      console.log("❌ CREATE BOOKING: No authenticated user");

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

    console.log("✅ Booking created:", booking._id);
    console.log("=================================\n");

    // ==========================
    // Response
    // ==========================

    return res.status(201).json({
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
    console.error("CREATE BOOKING ERROR:", error);

    return res.status(500).json({
      message: error.message || "Unable to create booking.",
    });
  }
};

// =========================================================
// GET LOGGED-IN USER BOOKINGS
// =========================================================

exports.getMyBookings = async (req, res) => {
  try {
    console.log("\n=================================");
    console.log("GET MY BOOKINGS");
    console.log("USER:", req.user);

    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      console.log("❌ No authenticated user");

      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const bookings = await Booking.find({
      user: userId,
    })
      .populate("hotel")
      .sort({ createdAt: -1 });

    console.log("✅ My bookings:", bookings.length);
    console.log("=================================\n");

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("GET MY BOOKINGS ERROR:", error);

    return res.status(500).json({
      message: error.message || "Unable to get bookings.",
    });
  }
};

// =========================================================
// GET SINGLE BOOKING
// =========================================================

exports.getBookingById = async (req, res) => {
  try {
    console.log("\n=================================");
    console.log("GET SINGLE BOOKING");
    console.log("BOOKING ID:", req.params.id);
    console.log("USER:", req.user);

    const booking = await Booking.findById(req.params.id)
      .populate("hotel")
      .populate("user", "name email");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    return res.status(200).json(booking);
  } catch (error) {
    console.error("GET BOOKING ERROR:", error);

    return res.status(500).json({
      message: error.message || "Unable to get booking.",
    });
  }
};

// =========================================================
// DELETE BOOKING
// =========================================================

exports.deleteBooking = async (req, res) => {
  try {
    console.log("\n=================================");
    console.log("DELETE BOOKING");
    console.log("BOOKING ID:", req.params.id);
    console.log("USER:", req.user);

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (booking.user.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You are not authorized to cancel this booking",
      });
    }

    await booking.deleteOne();

    console.log("✅ Booking deleted:", booking._id);
    console.log("=================================\n");

    return res.status(200).json({
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("DELETE BOOKING ERROR:", error);

    return res.status(500).json({
      message: error.message || "Unable to cancel booking.",
    });
  }
};

// =========================================================
// GET ALL BOOKINGS
// ADMIN
// =========================================================

exports.getAllBookings = async (req, res) => {
  try {
    console.log("\n=================================");
    console.log("GET ALL BOOKINGS");
    console.log("USER:", req.user);

    // Authentication check
    if (!req.user) {
      console.log("❌ GET ALL BOOKINGS: No authenticated user");

      return res.status(401).json({
        message: "Authentication required",
      });
    }

    console.log("USER ID:", req.user._id || req.user.id);
    console.log("USER EMAIL:", req.user.email);
    console.log("USER ROLE:", req.user.role);

    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("hotel", "name location price image")
      .sort({ createdAt: -1 });

    console.log("✅ Total bookings:", bookings.length);
    console.log("=================================\n");

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("GET ALL BOOKINGS ERROR:", error);

    return res.status(500).json({
      message: error.message || "Unable to get all bookings.",
    });
  }
};

// =========================================================
// GET BOOKINGS FOR HOTEL ADMIN'S HOTEL
// =========================================================

exports.getMyHotelBookings = async (req, res) => {
  try {
    console.log("\n=================================");
    console.log("GET HOTEL ADMIN BOOKINGS");
    console.log("USER:", req.user);

    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      console.log("❌ No authenticated user");

      return res.status(401).json({
        message: "Authentication required",
      });
    }

    console.log("HOTEL ADMIN USER ID:", userId);

    const hotel = await Hotel.findOne({
      hotelAdmin: userId,
    });

    if (!hotel) {
      console.log("❌ No hotel assigned to this hotel admin");

      return res.status(404).json({
        message: "No hotel is assigned to this hotel admin",
      });
    }

    console.log("HOTEL:", hotel._id);
    console.log("HOTEL NAME:", hotel.name);

    const bookings = await Booking.find({
      hotel: hotel._id,
    })
      .populate("user", "name email")
      .populate("hotel", "name location price image")
      .sort({ createdAt: -1 });

    console.log("✅ Hotel bookings:", bookings.length);
    console.log("=================================\n");

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("GET HOTEL ADMIN BOOKINGS ERROR:", error);

    return res.status(500).json({
      message: error.message || "Unable to get hotel bookings",
    });
  }

  // =========================================================
  // UPDATE BOOKING STATUS
  // HOTEL ADMIN
  // =========================================================

  exports.updateBookingStatus = async (req, res) => {
    try {
      console.log("\n=================================");
      console.log("UPDATE BOOKING STATUS");
      console.log("BOOKING ID:", req.params.id);
      console.log("USER:", req.user);
      console.log("NEW STATUS:", req.body.status);

      const userId = req.user?._id || req.user?.id;

      if (!userId) {
        return res.status(401).json({
          message: "Authentication required",
        });
      }

      const { status } = req.body;

      // ==========================
      // Validate status
      // ==========================

      if (!["confirmed", "cancelled"].includes(status)) {
        return res.status(400).json({
          message: "Invalid booking status.",
        });
      }

      // ==========================
      // Find booking
      // ==========================

      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        return res.status(404).json({
          message: "Booking not found",
        });
      }

      // ==========================
      // Find hotel owned by admin
      // ==========================

      const hotel = await Hotel.findOne({
        hotelAdmin: userId,
      });

      if (!hotel) {
        return res.status(404).json({
          message: "No hotel is assigned to this hotel admin",
        });
      }

      // ==========================
      // Security check
      // ==========================

      if (booking.hotel.toString() !== hotel._id.toString()) {
        return res.status(403).json({
          message: "You are not authorized to manage this booking.",
        });
      }

      // ==========================
      // Update status
      // ==========================

      booking.status = status;

      await booking.save();

      // ==========================
      // Return updated booking
      // ==========================

      const updatedBooking = await Booking.findById(booking._id)
        .populate("user", "name email")
        .populate("hotel", "name location price image");

      console.log("✅ Booking status updated:", updatedBooking._id);
      console.log("STATUS:", updatedBooking.status);
      console.log("=================================\n");

      return res.status(200).json({
        message: `Booking ${status} successfully`,
        booking: updatedBooking,
      });
    } catch (error) {
      console.error("UPDATE BOOKING STATUS ERROR:", error);

      return res.status(500).json({
        message: error.message || "Unable to update booking status.",
      });
    }
  };
};
