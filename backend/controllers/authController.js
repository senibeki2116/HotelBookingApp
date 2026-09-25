const jwt = require("jsonwebtoken");
const User = require("../models/user");

// =====================================================
// CREATE TOKEN
// =====================================================

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
};

// =====================================================
// REGISTER NORMAL USER
// =====================================================

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || "user",
    });

    const token = generateToken(user);

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    res.status(500).json({
      message: error.message || "Registration failed",
    });
  }
};

// =====================================================
// LOGIN
// =====================================================

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Works with a normal string password.
    // If your User model has a comparePassword method,
    // use it automatically.
    let passwordCorrect = false;

    if (typeof user.comparePassword === "function") {
      passwordCorrect = await user.comparePassword(password);
    } else {
      passwordCorrect = user.password === password;
    }

    if (!passwordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      message: error.message || "Login failed",
    });
  }
};

// =====================================================
// CREATE HOTEL ADMIN
// SUPER ADMIN ONLY
// =====================================================

exports.createHotelAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "A user with this email already exists",
      });
    }

    const hotelAdmin = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: "hoteladmin",
    });

    res.status(201).json({
      message: "Hotel admin created successfully",
      user: {
        id: hotelAdmin._id,
        _id: hotelAdmin._id,
        name: hotelAdmin.name,
        email: hotelAdmin.email,
        role: hotelAdmin.role,
      },
    });
  } catch (error) {
    console.error("CREATE HOTEL ADMIN ERROR:", error);

    res.status(500).json({
      message: error.message || "Unable to create hotel admin",
    });
  }
};

// =====================================================
// GET ALL HOTEL ADMINS
// SUPER ADMIN ONLY
// =====================================================

exports.getHotelAdmins = async (req, res) => {
  try {
    const hotelAdmins = await User.find({
      role: "hoteladmin",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(hotelAdmins);
  } catch (error) {
    console.error("GET HOTEL ADMINS ERROR:", error);

    res.status(500).json({
      message: error.message || "Unable to get hotel admins",
    });
  }
};

// =====================================================
// UPDATE HOTEL ADMIN
// SUPER ADMIN ONLY
// =====================================================

exports.updateHotelAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hotelAdmin = await User.findOne({
      _id: req.params.id,
      role: "hoteladmin",
    });

    if (!hotelAdmin) {
      return res.status(404).json({
        message: "Hotel admin not found",
      });
    }

    if (name !== undefined) {
      const cleanName = String(name).trim();

      if (!cleanName) {
        return res.status(400).json({
          message: "Name is required",
        });
      }

      hotelAdmin.name = cleanName;
    }

    if (email !== undefined) {
      const cleanEmail = String(email).toLowerCase().trim();

      if (!cleanEmail) {
        return res.status(400).json({
          message: "Email is required",
        });
      }

      const existingUser = await User.findOne({
        email: cleanEmail,
        _id: { $ne: hotelAdmin._id },
      });

      if (existingUser) {
        return res.status(400).json({
          message: "Another user already uses this email",
        });
      }

      hotelAdmin.email = cleanEmail;
    }

    if (password !== undefined && password !== "") {
      hotelAdmin.password = password;
    }

    await hotelAdmin.save();

    res.status(200).json({
      message: "Hotel admin updated successfully",
      user: {
        id: hotelAdmin._id,
        _id: hotelAdmin._id,
        name: hotelAdmin.name,
        email: hotelAdmin.email,
        role: hotelAdmin.role,
      },
    });
  } catch (error) {
    console.error("UPDATE HOTEL ADMIN ERROR:", error);

    res.status(500).json({
      message: error.message || "Unable to update hotel admin",
    });
  }
};

// =====================================================
// DELETE HOTEL ADMIN
// SUPER ADMIN ONLY
// =====================================================

exports.deleteHotelAdmin = async (req, res) => {
  try {
    const hotelAdmin = await User.findOne({
      _id: req.params.id,
      role: "hoteladmin",
    });

    if (!hotelAdmin) {
      return res.status(404).json({
        message: "Hotel admin not found",
      });
    }

    await hotelAdmin.deleteOne();

    res.status(200).json({
      message: "Hotel admin deleted successfully",
    });
  } catch (error) {
    console.error("DELETE HOTEL ADMIN ERROR:", error);

    res.status(500).json({
      message: error.message || "Unable to delete hotel admin",
    });
  }
};
