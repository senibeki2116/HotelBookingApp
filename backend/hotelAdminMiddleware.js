const hotelAdmin = (req, res, next) => {
  console.log("Hotel Admin user:", req.user);

  // Check if user is logged in and is a hotel admin
  if (req.user && req.user.role === "hoteladmin") {
    next();
  } else {
    res.status(403).json({
      message: "Hotel Admin access denied",
    });
  }
};

module.exports = hotelAdmin;
