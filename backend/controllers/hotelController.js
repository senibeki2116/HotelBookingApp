const Hotel = require("../models/Hotel");

// ======================================================
// GET ALL HOTELS
// ======================================================
const getHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find()
      .populate("createdBy", "name email")
      .populate("hotelAdmin", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(hotels);
  } catch (error) {
    console.error("GET HOTELS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch hotels",
      error: error.message,
    });
  }
};

// ======================================================
// GET SINGLE HOTEL
// ======================================================
const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("hotelAdmin", "name email");

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found",
      });
    }

    res.status(200).json(hotel);
  } catch (error) {
    console.error("GET HOTEL ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch hotel",
      error: error.message,
    });
  }
};

// ======================================================
// CREATE HOTEL
// ADMIN + HOTEL ADMIN
// ======================================================
const createHotel = async (req, res) => {
  try {
    const { name, location, description, price, rooms, image } = req.body;

    // -----------------------------
    // VALIDATION
    // -----------------------------
    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Hotel name is required",
      });
    }

    if (!location || !location.trim()) {
      return res.status(400).json({
        message: "Hotel location is required",
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        message: "Hotel description is required",
      });
    }

    if (
      price === undefined ||
      price === null ||
      price === "" ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        message: "Valid hotel price is required",
      });
    }

    if (
      rooms === undefined ||
      rooms === null ||
      rooms === "" ||
      Number(rooms) < 1
    ) {
      return res.status(400).json({
        message: "Valid number of rooms is required",
      });
    }

    // -----------------------------
    // LOGGED-IN USER
    // -----------------------------
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "User authentication is required",
      });
    }

    // -----------------------------
    // CHECK ROLE
    // -----------------------------
    if (req.user.role !== "admin" && req.user.role !== "hoteladmin") {
      return res.status(403).json({
        message: "Only admin or hotel admin can create a hotel",
      });
    }

    // -----------------------------
    // PREVENT MULTIPLE HOTELS
    // FOR ONE HOTEL ADMIN
    // -----------------------------
    if (req.user.role === "hoteladmin") {
      const existingHotel = await Hotel.findOne({
        hotelAdmin: userId,
      });

      if (existingHotel) {
        return res.status(400).json({
          message: "You already have a hotel. You cannot create another hotel.",
          hotel: existingHotel,
        });
      }
    }

    // -----------------------------
    // CREATE HOTEL
    // -----------------------------
    const hotel = await Hotel.create({
      name: name.trim(),
      location: location.trim(),
      description: description.trim(),
      price: Number(price),
      rooms: Number(rooms),
      image: image ? image.trim() : "",

      // Whoever created it
      createdBy: userId,

      // IMPORTANT:
      // Hotel admin automatically becomes
      // the manager of this hotel.
      hotelAdmin: req.user.role === "hoteladmin" ? userId : null,
    });

    const populatedHotel = await Hotel.findById(hotel._id)
      .populate("createdBy", "name email")
      .populate("hotelAdmin", "name email");

    res.status(201).json({
      message: "Hotel created successfully",
      hotel: populatedHotel,
    });
  } catch (error) {
    console.error("CREATE HOTEL ERROR:", error);

    res.status(500).json({
      message: "Failed to create hotel",
      error: error.message,
    });
  }
};

// ======================================================
// GET HOTEL FOR LOGGED-IN HOTEL ADMIN
// ======================================================
const getMyHotel = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "User authentication is required",
      });
    }

    const hotel = await Hotel.findOne({
      hotelAdmin: userId,
    })
      .populate("createdBy", "name email")
      .populate("hotelAdmin", "name email");

    if (!hotel) {
      return res.status(404).json({
        message: "No hotel is assigned to this hotel admin",
      });
    }

    res.status(200).json({
      hotel,
    });
  } catch (error) {
    console.error("GET MY HOTEL ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch your hotel",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE HOTEL
// ======================================================
const updateHotel = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "User authentication is required",
      });
    }

    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found",
      });
    }

    // Hotel admin can only update their own hotel
    if (
      req.user.role === "hoteladmin" &&
      String(hotel.hotelAdmin) !== String(userId)
    ) {
      return res.status(403).json({
        message: "You can only update your own hotel",
      });
    }

    const { name, location, description, price, rooms, image } = req.body;

    if (name !== undefined) {
      hotel.name = name.trim();
    }

    if (location !== undefined) {
      hotel.location = location.trim();
    }

    if (description !== undefined) {
      hotel.description = description.trim();
    }

    if (price !== undefined) {
      hotel.price = Number(price);
    }

    if (rooms !== undefined) {
      hotel.rooms = Number(rooms);
    }

    if (image !== undefined) {
      hotel.image = image.trim();
    }

    await hotel.save();

    const updatedHotel = await Hotel.findById(hotel._id)
      .populate("createdBy", "name email")
      .populate("hotelAdmin", "name email");

    res.status(200).json({
      message: "Hotel updated successfully",
      hotel: updatedHotel,
    });
  } catch (error) {
    console.error("UPDATE HOTEL ERROR:", error);

    res.status(500).json({
      message: "Failed to update hotel",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE MY HOTEL
// ======================================================
const updateMyHotel = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "User authentication is required",
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

    const { name, location, description, price, rooms, image } = req.body;

    if (name !== undefined) {
      hotel.name = name.trim();
    }

    if (location !== undefined) {
      hotel.location = location.trim();
    }

    if (description !== undefined) {
      hotel.description = description.trim();
    }

    if (price !== undefined) {
      hotel.price = Number(price);
    }

    if (rooms !== undefined) {
      hotel.rooms = Number(rooms);
    }

    if (image !== undefined) {
      hotel.image = image.trim();
    }

    await hotel.save();

    const updatedHotel = await Hotel.findById(hotel._id)
      .populate("createdBy", "name email")
      .populate("hotelAdmin", "name email");

    res.status(200).json({
      message: "Hotel updated successfully",
      hotel: updatedHotel,
    });
  } catch (error) {
    console.error("UPDATE MY HOTEL ERROR:", error);

    res.status(500).json({
      message: "Failed to update your hotel",
      error: error.message,
    });
  }
};

// ======================================================
// DELETE HOTEL
// ======================================================
const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found",
      });
    }

    await Hotel.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Hotel deleted successfully",
    });
  } catch (error) {
    console.error("DELETE HOTEL ERROR:", error);

    res.status(500).json({
      message: "Failed to delete hotel",
      error: error.message,
    });
  }
};

module.exports = {
  getHotels,
  getHotelById,
  createHotel,
  getMyHotel,
  updateHotel,
  updateMyHotel,
  deleteHotel,
};
