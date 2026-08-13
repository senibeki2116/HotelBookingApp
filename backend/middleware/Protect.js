const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  console.log("Authorization header:", req.headers.authorization);

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      console.log("Decoded token:", decoded);

      req.user = (await User.findById(decoded.id).select("-password")) || {
        _id: decoded.id,
        role: decoded.role || "user",
        email: decoded.email || "",
        name: decoded.name || "",
      };

      console.log("User found:", req.user);

      next();
    } catch (error) {
      console.error("Auth error:", error);

      return res.status(401).json({
        message: "Invalid token",
      });
    }
  } else {
    console.log("No Bearer token received");

    return res.status(401).json({
      message: "Not authorized, no token",
    });
  }
};

module.exports = protect;
