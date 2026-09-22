const Hotel = require("../models/Hotel");

const hotelAdmin = async (req, res, next) => {
  try {
    // Make sure the user is logged in
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Super Admin can access everything
    if (req.user.role === "admin") {
      req.isSuperAdmin = true;
      return next();
    }

    // Only hotel admins can continue
    if (req.user.role !== "hoteladmin") {
      return res.status(403).json({
        message: "Hotel Admin access denied",
      });
    }

    // Find the hotel assigned to this hotel admin
    const hotel = await Hotel.findOne({
      hotelAdmin: req.user._id,
    });

    if (!hotel) {
      return res.status(403).json({
        message: "No hotel is assigned to this hotel admin",
      });
    }

    // Save assigned hotel information in request
    req.hotel = hotel;
    req.hotelId = hotel._id;

    next();
  } catch (error) {
    console.error("HOTEL ADMIN MIDDLEWARE ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = hotelAdmin;
