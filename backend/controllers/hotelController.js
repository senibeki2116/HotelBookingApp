const Hotel = require("../models/Hotel");
const User = require("../models/user");

// =====================================================
// CREATE HOTEL
// SUPER ADMIN ONLY
// =====================================================
exports.createHotel = async (req, res) => {
  try {
    const hotel = await Hotel.create({
      name: req.body.name,
      location: req.body.location,
      description: req.body.description,
      price: req.body.price,
      image: req.body.image,
      rooms: Number(req.body.rooms) || 1,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Hotel created successfully",
      hotel,
    });
  } catch (error) {
    console.error("Create hotel error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// GET ALL HOTELS
// PUBLIC
// =====================================================
exports.getHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find()
      .populate("createdBy", "name email role")
      .populate("hotelAdmin", "name email role");

    res.json(hotels);
  } catch (error) {
    console.error("Get hotels error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// GET SINGLE HOTEL
// PUBLIC
// =====================================================
exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate("createdBy", "name email role")
      .populate("hotelAdmin", "name email role");

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found",
      });
    }

    res.json(hotel);
  } catch (error) {
    console.error("Get hotel error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE HOTEL
// SUPER ADMIN ONLY
// =====================================================
exports.updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found",
      });
    }

    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    res.json(updatedHotel);
  } catch (error) {
    console.error("Update hotel error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// DELETE HOTEL
// SUPER ADMIN ONLY
// =====================================================
exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found",
      });
    }

    await Hotel.findByIdAndDelete(req.params.id);

    res.json({
      message: "Hotel deleted successfully",
    });
  } catch (error) {
    console.error("Delete hotel error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// ASSIGN HOTEL ADMIN
// SUPER ADMIN ONLY
// =====================================================
exports.assignHotelAdmin = async (req, res) => {
  try {
    const { hotelAdminId } = req.body;

    if (!hotelAdminId) {
      return res.status(400).json({
        message: "Hotel Admin ID is required",
      });
    }

    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found",
      });
    }

    const hotelAdmin = await User.findById(hotelAdminId);

    if (!hotelAdmin) {
      return res.status(404).json({
        message: "Hotel Admin user not found",
      });
    }

    if (hotelAdmin.role !== "hoteladmin") {
      return res.status(400).json({
        message: "Selected user is not a hotel admin",
      });
    }

    // Prevent one hotel admin from being assigned
    // to multiple hotels.
    const existingAssignment = await Hotel.findOne({
      hotelAdmin: hotelAdmin._id,
      _id: { $ne: hotel._id },
    });

    if (existingAssignment) {
      return res.status(400).json({
        message: "This hotel admin is already assigned to another hotel",
      });
    }

    hotel.hotelAdmin = hotelAdmin._id;

    await hotel.save();

    const updatedHotel = await Hotel.findById(hotel._id)
      .populate("createdBy", "name email role")
      .populate("hotelAdmin", "name email role");

    res.json({
      message: "Hotel Admin assigned successfully",
      hotel: updatedHotel,
    });
  } catch (error) {
    console.error("Assign hotel admin error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// GET MY ASSIGNED HOTEL
// HOTEL ADMIN
// =====================================================
exports.getMyHotel = async (req, res) => {
  try {
    console.log("=================================");
    console.log("GET MY HOTEL");
    console.log("USER:", req.user);
    console.log("USER ID:", req.user?._id);
    console.log("USER ROLE:", req.user?.role);

    const hotel = await Hotel.findOne({
      hotelAdmin: req.user._id,
    })
      .populate("createdBy", "name email role")
      .populate("hotelAdmin", "name email role");

    console.log("FOUND HOTEL:", hotel);

    if (!hotel) {
      return res.status(404).json({
        message: "No hotel is assigned to this hotel admin",
      });
    }

    res.json(hotel);
  } catch (error) {
    console.error("GET MY HOTEL ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE MY ASSIGNED HOTEL
// HOTEL ADMIN
// =====================================================
exports.updateMyHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({
      hotelAdmin: req.user._id,
    });

    if (!hotel) {
      return res.status(404).json({
        message: "No hotel is assigned to this hotel admin",
      });
    }

    // Hotel admin cannot change ownership fields.
    const allowedUpdates = {
      name: req.body.name,
      location: req.body.location,
      description: req.body.description,
      price: req.body.price,
      image: req.body.image,
      rooms: req.body.rooms,
    };

    // Remove undefined values
    Object.keys(allowedUpdates).forEach((key) => {
      if (allowedUpdates[key] === undefined) {
        delete allowedUpdates[key];
      }
    });

    const updatedHotel = await Hotel.findByIdAndUpdate(
      hotel._id,
      allowedUpdates,
      {
        new: true,
        runValidators: true,
      },
    )
      .populate("createdBy", "name email role")
      .populate("hotelAdmin", "name email role");

    res.json({
      message: "Your hotel updated successfully",
      hotel: updatedHotel,
    });
  } catch (error) {
    console.error("Update my hotel error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};
