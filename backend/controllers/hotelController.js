const Hotel = require("../models/Hotel");

// Create Hotel
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

// Get All Hotels
exports.getHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find();

    res.json(hotels);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// Update Hotel
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
      { returnDocument: "after", runValidators: true },
    );

    res.json(updatedHotel);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// Delete Hotel
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
    res.status(500).json({
      message: error.message,
    });
  }
};
// Get Single Hotel
exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found",
      });
    }

    res.json(hotel);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
