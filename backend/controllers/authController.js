const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

// =====================================================
// CREATE JWT TOKEN
// =====================================================

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
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
// CHECK PASSWORD
// Supports:
// 1. Existing plain-text passwords
// 2. New bcrypt hashed passwords
// =====================================================

const checkPassword = async (enteredPassword, storedPassword) => {
  if (!storedPassword) {
    return false;
  }

  const isBcryptPassword =
    storedPassword.startsWith("$2a$") ||
    storedPassword.startsWith("$2b$") ||
    storedPassword.startsWith("$2y$");

  if (isBcryptPassword) {
    return bcrypt.compare(enteredPassword, storedPassword);
  }

  // Backward compatibility for old plain-text passwords
  return enteredPassword === storedPassword;
};

// =====================================================
// REGISTER NORMAL USER
// =====================================================

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).toLowerCase().trim();

    if (!cleanName) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    if (!cleanEmail) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      role: "user",
      isActive: true,
    });

    const token = generateToken(user);

    return res.status(201).json({
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

    return res.status(500).json({
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

    console.log("=================================");
    console.log("LOGIN REQUEST");
    console.log("=================================");
    console.log("Email:", email);
    console.log("Password provided:", !!password);

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const cleanEmail = String(email).toLowerCase().trim();

    const user = await User.findOne({
      email: cleanEmail,
    });

    console.log("USER FOUND:", !!user);

    if (user) {
      console.log("USER ID:", user._id);
      console.log("USER EMAIL:", user.email);
      console.log("USER ROLE:", user.role);
      console.log("USER ACTIVE:", user.isActive);
    }

    if (!user) {
      console.log("LOGIN FAILED: USER NOT FOUND");

      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (user.isActive === false) {
      console.log("LOGIN FAILED: ACCOUNT DEACTIVATED");

      return res.status(401).json({
        message: "Your account has been deactivated",
      });
    }

    const passwordCorrect = await checkPassword(
      String(password),
      user.password,
    );

    console.log("PASSWORD CORRECT:", passwordCorrect);

    if (!passwordCorrect) {
      console.log("LOGIN FAILED: WRONG PASSWORD");

      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // =================================================
    // MIGRATE OLD PLAIN-TEXT PASSWORD
    // =================================================

    const isAlreadyHashed =
      user.password &&
      (user.password.startsWith("$2a$") ||
        user.password.startsWith("$2b$") ||
        user.password.startsWith("$2y$"));

    if (!isAlreadyHashed) {
      console.log("OLD PASSWORD FORMAT DETECTED");
      console.log("HASHING PASSWORD...");

      user.password = await bcrypt.hash(String(password), 10);

      await user.save();

      console.log("PASSWORD SUCCESSFULLY MIGRATED TO BCRYPT");
    }

    const token = generateToken(user);

    console.log("TOKEN GENERATED:", !!token);
    console.log("LOGIN SUCCESS");
    console.log("USER ROLE:", user.role);
    console.log("=================================");

    return res.status(200).json({
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
    console.error("=================================");
    console.error("LOGIN ERROR");
    console.error("=================================");
    console.error(error);

    return res.status(500).json({
      message: error.message || "Login failed",
    });
  }
};

// =====================================================
// CREATE HOTEL ADMIN
// ADMIN ONLY
// =====================================================

exports.createHotelAdmin = async (req, res) => {
  try {
    console.log("=================================");
    console.log("CREATE HOTEL ADMIN");
    console.log("REQUEST USER:", req.user);
    console.log("=================================");

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).toLowerCase().trim();

    if (!cleanName) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    if (!cleanEmail) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "A user with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const hotelAdmin = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      role: "hoteladmin",
      isActive: true,
    });

    console.log("HOTEL ADMIN CREATED:");
    console.log("ID:", hotelAdmin._id);
    console.log("NAME:", hotelAdmin.name);
    console.log("EMAIL:", hotelAdmin.email);
    console.log("ROLE:", hotelAdmin.role);

    return res.status(201).json({
      message: "Hotel admin created successfully",
      user: {
        id: hotelAdmin._id,
        _id: hotelAdmin._id,
        name: hotelAdmin.name,
        email: hotelAdmin.email,
        role: hotelAdmin.role,
        isActive: hotelAdmin.isActive,
      },
    });
  } catch (error) {
    console.error("CREATE HOTEL ADMIN ERROR:", error);

    return res.status(500).json({
      message: error.message || "Unable to create hotel admin",
    });
  }
};

// =====================================================
// GET ALL HOTEL ADMINS
// ADMIN ONLY
// =====================================================

exports.getHotelAdmins = async (req, res) => {
  try {
    console.log("=================================");
    console.log("GET ALL HOTEL ADMINS");
    console.log("REQUEST USER:", req.user);
    console.log("REQUEST USER ROLE:", req.user?.role);
    console.log("=================================");

    const hotelAdmins = await User.find({
      role: "hoteladmin",
    })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    console.log("TOTAL HOTEL ADMINS:", hotelAdmins.length);

    if (hotelAdmins.length > 0) {
      console.log(
        "HOTEL ADMINS:",
        hotelAdmins.map((admin) => ({
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          isActive: admin.isActive,
        })),
      );
    }

    return res.status(200).json(hotelAdmins);
  } catch (error) {
    console.error("GET HOTEL ADMINS ERROR:", error);

    return res.status(500).json({
      message: error.message || "Unable to get hotel admins",
    });
  }
};

// =====================================================
// UPDATE HOTEL ADMIN
// ADMIN ONLY
// =====================================================

exports.updateHotelAdmin = async (req, res) => {
  try {
    console.log("=================================");
    console.log("UPDATE HOTEL ADMIN");
    console.log("ADMIN ID:", req.params.id);
    console.log("REQUEST USER:", req.user);
    console.log("=================================");

    const { name, email, password, isActive } = req.body;

    const hotelAdmin = await User.findOne({
      _id: req.params.id,
      role: "hoteladmin",
    });

    if (!hotelAdmin) {
      return res.status(404).json({
        message: "Hotel admin not found",
      });
    }

    // =================================================
    // UPDATE NAME
    // =================================================

    if (name !== undefined) {
      const cleanName = String(name).trim();

      if (!cleanName) {
        return res.status(400).json({
          message: "Name is required",
        });
      }

      hotelAdmin.name = cleanName;
    }

    // =================================================
    // UPDATE EMAIL
    // =================================================

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

    // =================================================
    // UPDATE PASSWORD
    // =================================================

    if (password !== undefined && password !== "") {
      if (String(password).length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters",
        });
      }

      hotelAdmin.password = await bcrypt.hash(String(password), 10);
    }

    // =================================================
    // UPDATE ACTIVE STATUS
    // =================================================

    if (isActive !== undefined) {
      hotelAdmin.isActive = Boolean(isActive);
    }

    await hotelAdmin.save();

    console.log("HOTEL ADMIN UPDATED:");
    console.log("ID:", hotelAdmin._id);
    console.log("NAME:", hotelAdmin.name);
    console.log("EMAIL:", hotelAdmin.email);
    console.log("ROLE:", hotelAdmin.role);
    console.log("ACTIVE:", hotelAdmin.isActive);

    return res.status(200).json({
      message: "Hotel admin updated successfully",
      user: {
        id: hotelAdmin._id,
        _id: hotelAdmin._id,
        name: hotelAdmin.name,
        email: hotelAdmin.email,
        role: hotelAdmin.role,
        isActive: hotelAdmin.isActive,
      },
    });
  } catch (error) {
    console.error("UPDATE HOTEL ADMIN ERROR:", error);

    return res.status(500).json({
      message: error.message || "Unable to update hotel admin",
    });
  }
};

// =====================================================
// DELETE HOTEL ADMIN
// ADMIN ONLY
// =====================================================

exports.deleteHotelAdmin = async (req, res) => {
  try {
    console.log("=================================");
    console.log("DELETE HOTEL ADMIN");
    console.log("ADMIN ID:", req.params.id);
    console.log("REQUEST USER:", req.user);
    console.log("=================================");

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

    console.log("HOTEL ADMIN DELETED:", req.params.id);

    return res.status(200).json({
      message: "Hotel admin deleted successfully",
    });
  } catch (error) {
    console.error("DELETE HOTEL ADMIN ERROR:", error);

    return res.status(500).json({
      message: error.message || "Unable to delete hotel admin",
    });
  }
};
