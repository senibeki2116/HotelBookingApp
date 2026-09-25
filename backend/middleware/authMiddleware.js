const jwt = require("jsonwebtoken");
const User = require("../models/user");

// =====================================================
// PROTECT ROUTES
// =====================================================

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    console.log("Authorization header:", authHeader ? "Present" : "Missing");

    // Check Bearer token
    if (!authHeader.toLowerCase().startsWith("bearer ")) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    // Get token
    const token = authHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("JWT decoded:", decoded);

    // Find current user in database
    let user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // Attach user to request
    req.user = {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    console.log("Authenticated user:", req.user);

    next();
  } catch (error) {
    console.error("JWT ERROR:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

// =====================================================
// SUPER ADMIN ONLY
// =====================================================

const adminOnly = (req, res, next) => {
  const role = String(req.user?.role || "")
    .trim()
    .toLowerCase();

  console.log("Admin role check:", role);

  if (!req.user || role !== "admin") {
    return res.status(403).json({
      message: "Admin access only",
    });
  }

  next();
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  protect,
  adminOnly,
};
