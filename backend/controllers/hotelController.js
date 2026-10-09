const Hotel = require("../models/Hotel");

// ======================================================
// GET ALL HOTELS
// ======================================================
const getHotels = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");

    const hotels = await Hotel.find()
      .populate("createdBy", "name email")
      .populate("hotelAdmin", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(hotels);
  } catch (error) {
    console.error("GET HOTELS ERROR:", error);

    return res.status(500).json({
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

    return res.status(200).json(hotel);
  } catch (error) {
    console.error("GET HOTEL ERROR:", error);

    return res.status(500).json({
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

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        message: "Hotel name is required",
      });
    }

    if (!location || !String(location).trim()) {
      return res.status(400).json({
        message: "Hotel location is required",
      });
    }

    if (!description || !String(description).trim()) {
      return res.status(400).json({
        message: "Hotel description is required",
      });
    }

    if (
      price === undefined ||
      price === null ||
      price === "" ||
      !Number.isFinite(Number(price)) ||
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
      !Number.isFinite(Number(rooms)) ||
      Number(rooms) < 1
    ) {
      return res.status(400).json({
        message: "Valid number of rooms is required",
      });
    }

    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "User authentication is required",
      });
    }

    const role = String(req.user.role || "").toLowerCase();

    if (role !== "admin" && role !== "hoteladmin") {
      return res.status(403).json({
        message: "Only admin or hotel admin can create a hotel",
      });
    }

    // Prevent a hotel admin from creating multiple hotels.
    if (role === "hoteladmin") {
      const existingHotel = await Hotel.findOne({
        $or: [
          { hotelAdmin: userId },
          { createdBy: userId, hotelAdmin: { $exists: false } },
        ],
      });

      if (existingHotel) {
        return res.status(400).json({
          message: "You already have a hotel. You cannot create another hotel.",
          hotel: existingHotel,
        });
      }
    }

    const hotel = await Hotel.create({
      name: String(name).trim(),
      location: String(location).trim(),
      description: String(description).trim(),
      price: Number(price),
      rooms: Number(rooms),
      image: image ? String(image).trim() : "",
      createdBy: userId,
      hotelAdmin: role === "hoteladmin" ? userId : null,
    });

    const populatedHotel = await Hotel.findById(hotel._id)
      .populate("createdBy", "name email")
      .populate("hotelAdmin", "name email");

    return res.status(201).json({
      message: "Hotel created successfully",
      hotel: populatedHotel,
    });
  } catch (error) {
    console.error("CREATE HOTEL ERROR:", error);

    return res.status(500).json({
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

    console.log("GET MY HOTEL - USER ID:", String(userId));
    console.log("GET MY HOTEL - USER ROLE:", req.user?.role);

    // Find the hotel assigned to this user or created by them.
    const hotel = await Hotel.findOne({
      $or: [{ hotelAdmin: userId }, { createdBy: userId }],
    })
      .populate("createdBy", "name email")
      .populate("hotelAdmin", "name email")
      .lean();

    res.set("Cache-Control", "no-store");

    if (!hotel) {
      console.log("GET MY HOTEL - NO MATCH FOUND");

      return res.status(404).json({
        message: "No hotel is assigned to this hotel admin",
      });
    }

    console.log("GET MY HOTEL - FOUND:", hotel.name);

    return res.status(200).json({
      hotel,
    });
  } catch (error) {
    console.error("GET MY HOTEL ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch your hotel",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE HOTEL BY ID
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

    const role = String(req.user.role || "").toLowerCase();

    if (
      role === "hoteladmin" &&
      String(hotel.hotelAdmin || "") !== String(userId) &&
      String(hotel.createdBy || "") !== String(userId)
    ) {
      return res.status(403).json({
        message: "You can only update your own hotel",
      });
    }

    const { name, location, description, price, rooms, image } = req.body;

    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({
          message: "Hotel name cannot be empty",
        });
      }
      hotel.name = String(name).trim();
    }

    if (location !== undefined) {
      if (!String(location).trim()) {
        return res.status(400).json({
          message: "Hotel location cannot be empty",
        });
      }
      hotel.location = String(location).trim();
    }

    if (description !== undefined) {
      if (!String(description).trim()) {
        return res.status(400).json({
          message: "Hotel description cannot be empty",
        });
      }
      hotel.description = String(description).trim();
    }

    if (price !== undefined) {
      if (
        price === "" ||
        !Number.isFinite(Number(price)) ||
        Number(price) < 0
      ) {
        return res.status(400).json({
          message: "Valid hotel price is required",
        });
      }
      hotel.price = Number(price);
    }

    if (rooms !== undefined) {
      if (
        rooms === "" ||
        !Number.isFinite(Number(rooms)) ||
        Number(rooms) < 1
      ) {
        return res.status(400).json({
          message: "Valid number of rooms is required",
        });
      }
      hotel.rooms = Number(rooms);
    }

    if (image !== undefined) {
      hotel.image = String(image).trim();
    }

    await hotel.save();

    const updatedHotel = await Hotel.findById(hotel._id)
      .populate("createdBy", "name email")
      .populate("hotelAdmin", "name email");

    return res.status(200).json({
      message: "Hotel updated successfully",
      hotel: updatedHotel,
    });
  } catch (error) {
    console.error("UPDATE HOTEL ERROR:", error);

    return res.status(500).json({
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
      $or: [{ hotelAdmin: userId }, { createdBy: userId }],
    });

    if (!hotel) {
      return res.status(404).json({
        message: "No hotel is assigned to this hotel admin",
      });
    }

    const { name, location, description, price, rooms, image } = req.body;

    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({
          message: "Hotel name cannot be empty",
        });
      }
      hotel.name = String(name).trim();
    }

    if (location !== undefined) {
      if (!String(location).trim()) {
        return res.status(400).json({
          message: "Hotel location cannot be empty",
        });
      }
      hotel.location = String(location).trim();
    }

    if (description !== undefined) {
      if (!String(description).trim()) {
        return res.status(400).json({
          message: "Hotel description cannot be empty",
        });
      }
      hotel.description = String(description).trim();
    }

    if (price !== undefined) {
      if (
        price === "" ||
        !Number.isFinite(Number(price)) ||
        Number(price) < 0
      ) {
        return res.status(400).json({
          message: "Valid hotel price is required",
        });
      }
      hotel.price = Number(price);
    }

    if (rooms !== undefined) {
      if (
        rooms === "" ||
        !Number.isFinite(Number(rooms)) ||
        Number(rooms) < 1
      ) {
        return res.status(400).json({
          message: "Valid number of rooms is required",
        });
      }
      hotel.rooms = Number(rooms);
    }

    if (image !== undefined) {
      hotel.image = String(image).trim();
    }

    await hotel.save();

    const updatedHotel = await Hotel.findById(hotel._id)
      .populate("createdBy", "name email")
      .populate("hotelAdmin", "name email");

    return res.status(200).json({
      message: "Hotel updated successfully",
      hotel: updatedHotel,
    });
  } catch (error) {
    console.error("UPDATE MY HOTEL ERROR:", error);

    return res.status(500).json({
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

    return res.status(200).json({
      message: "Hotel deleted successfully",
    });
  } catch (error) {
    console.error("DELETE HOTEL ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete hotel",
      error: error.message,
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================
module.exports = {
  getHotels,
  getHotelById,
  createHotel,
  getMyHotel,
  updateHotel,
  updateMyHotel,
  deleteHotel,
};
