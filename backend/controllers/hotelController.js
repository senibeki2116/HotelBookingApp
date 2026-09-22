const Hotel = require("../models/Hotel");
const User = require("../models/user");

// =====================================================
// CREATE HOTEL
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
// =====================================================
exports.updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found",
      });
    }

    const isOwner =
      hotel.createdBy && hotel.createdBy.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "Not authorized",
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
// =====================================================
exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found",
      });
    }

    const isOwner =
      hotel.createdBy && hotel.createdBy.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "Not authorized",
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
// =====================================================
exports.assignHotelAdmin = async (req, res) => {
  try {
    const { hotelAdminId } = req.body;

    // Check hotel admin ID
    if (!hotelAdminId) {
      return res.status(400).json({
        message: "Hotel Admin ID is required",
      });
    }

    // Find hotel
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found",
      });
    }

    // Find user
    const hotelAdmin = await User.findById(hotelAdminId);

    if (!hotelAdmin) {
      return res.status(404).json({
        message: "Hotel Admin user not found",
      });
    }

    // Make sure the user has hoteladmin role
    if (hotelAdmin.role !== "hoteladmin") {
      return res.status(400).json({
        message: "Selected user is not a hotel admin",
      });
    }

    // Assign admin to hotel
    hotel.hotelAdmin = hotelAdmin._id;

    await hotel.save();

    // Return updated hotel with admin information
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
