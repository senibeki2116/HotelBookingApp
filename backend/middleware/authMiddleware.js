const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  const authHeader = (req.headers.authorization || "").trim();
  const rawToken = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.split(/\s+/).slice(1).join(" ").trim()
    : authHeader;

  if (!rawToken) {
    return res.status(401).json({
      message: "No token provided",
    });
  }

  try {
    const decoded = jwt.verify(rawToken, process.env.JWT_SECRET);

    let user = await User.findById(decoded.id).select("-password");

    if (!user) {
      user = {
        _id: decoded.id,
        id: decoded.id,
        role: decoded.role || "user",
        email: decoded.email || "",
        name: decoded.name || "",
      };
    } else {
      user = user.toObject ? user.toObject() : user;
      user._id = user._id || decoded.id;
      user.id = user.id || String(user._id || decoded.id);
      user.role = user.role || decoded.role || "user";
    }

    req.user = user;
    req.user._id = req.user._id || decoded.id;
    req.user.id = req.user.id || String(req.user._id || decoded.id);
    return next();
  } catch (error) {
    console.log("JWT ERROR:", error.message);

    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

const adminOnly = (req, res, next) => {
  const role = String((req.user && (req.user.role || req.user.userRole)) || "")
    .trim()
    .toLowerCase();

  if (!req.user || role !== "admin") {
    console.log("ADMIN CHECK FAILED", {
      hasUser: !!req.user,
      role,
      user: req.user,
    });

    return res.status(403).json({
      message: "Admin access only",
    });
  }

  next();
};

module.exports = {
  protect,
  adminOnly,
};
