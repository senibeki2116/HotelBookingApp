const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register User
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isFirstUser = (await User.countDocuments()) === 0;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: isFirstUser ? "admin" : "user",
    });

    res.status(201).json({
      message: "User registered",
      user,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Create Token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.status(200).json({
      message: "Login Successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Create Hotel Admin
// Only Super Admin can access this function
exports.createHotelAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Hotel Admin
    const hotelAdmin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "hoteladmin",
    });

    res.status(201).json({
      message: "Hotel Admin created successfully",
      user: {
        id: hotelAdmin._id,
        name: hotelAdmin.name,
        email: hotelAdmin.email,
        role: hotelAdmin.role,
      },
    });
  } catch (err) {
    console.error("Create Hotel Admin error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};
