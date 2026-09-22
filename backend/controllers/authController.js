const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Hotel = require("../models/Hotel");
const bcrypt = require("bcrypt");

// =====================================================
// REGISTER USER
// =====================================================
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // First registered user becomes super admin
    const isFirstUser = (await User.countDocuments()) === 0;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: isFirstUser ? "admin" : "user",
    });

    res.status(201).json({
      message: "User registered successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// LOGIN USER
// =====================================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    console.log("LOGIN USER:", user);

    res.json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// CREATE HOTEL ADMIN
// =====================================================
const createHotelAdmin = async (req, res) => {
  try {
    const { name, email, password, hotelId } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // Check email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // If a hotel is selected, check it exists
    if (hotelId) {
      const hotel = await Hotel.findById(hotelId);

      if (!hotel) {
        return res.status(404).json({
          message: "Hotel not found",
        });
      }

      // Check whether hotel already has an admin
      if (hotel.hotelAdmin) {
        return res.status(400).json({
          message: "This hotel is already assigned to another admin",
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create hotel admin
    const hotelAdmin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "hoteladmin",
    });

    // Assign hotel
    if (hotelId) {
      await Hotel.findByIdAndUpdate(
        hotelId,
        {
          hotelAdmin: hotelAdmin._id,
        },
        {
          new: true,
        },
      );
    }

    res.status(201).json({
      message: "Hotel admin created successfully",

      user: {
        id: hotelAdmin._id,
        name: hotelAdmin.name,
        email: hotelAdmin.email,
        role: hotelAdmin.role,
      },
    });
  } catch (error) {
    console.error("CREATE HOTEL ADMIN ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// GET ALL HOTEL ADMINS
// =====================================================
const getHotelAdmins = async (req, res) => {
  try {
    const admins = await User.find({
      role: "hoteladmin",
    }).select("-password -token");

    const result = await Promise.all(
      admins.map(async (admin) => {
        const hotel = await Hotel.findOne({
          hotelAdmin: admin._id,
        }).select("name location");

        return {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,

          hotel: hotel
            ? {
                id: hotel._id,
                name: hotel.name,
                location: hotel.location,
              }
            : null,
        };
      }),
    );

    res.json(result);
  } catch (error) {
    console.error("GET HOTEL ADMINS ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE HOTEL ADMIN
// =====================================================
const updateHotelAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, email, password, hotelId } = req.body;

    // Find hotel admin
    const adminUser = await User.findOne({
      _id: id,
      role: "hoteladmin",
    });

    if (!adminUser) {
      return res.status(404).json({
        message: "Hotel admin not found",
      });
    }

    // ---------------------------------------------
    // Update name
    // ---------------------------------------------
    if (name) {
      adminUser.name = name;
    }

    // ---------------------------------------------
    // Update email
    // ---------------------------------------------
    if (email && email !== adminUser.email) {
      const existingEmail = await User.findOne({
        email,
        _id: {
          $ne: id,
        },
      });

      if (existingEmail) {
        return res.status(400).json({
          message: "Email already exists",
        });
      }

      adminUser.email = email;
    }

    // ---------------------------------------------
    // Update password
    // ---------------------------------------------
    if (password) {
      adminUser.password = await bcrypt.hash(password, 10);
    }

    await adminUser.save();

    // ---------------------------------------------
    // Remove current hotel assignment
    // ---------------------------------------------
    await Hotel.updateMany(
      {
        hotelAdmin: adminUser._id,
      },
      {
        $set: {
          hotelAdmin: null,
        },
      },
    );

    // ---------------------------------------------
    // Assign new hotel
    // ---------------------------------------------
    if (hotelId) {
      const hotel = await Hotel.findById(hotelId);

      if (!hotel) {
        return res.status(404).json({
          message: "Hotel not found",
        });
      }

      // Check if another admin owns this hotel
      if (
        hotel.hotelAdmin &&
        hotel.hotelAdmin.toString() !== adminUser._id.toString()
      ) {
        return res.status(400).json({
          message: "This hotel is already assigned to another admin",
        });
      }

      hotel.hotelAdmin = adminUser._id;

      await hotel.save();
    }

    res.json({
      message: "Hotel admin updated successfully",

      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
    });
  } catch (error) {
    console.error("UPDATE HOTEL ADMIN ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// DELETE HOTEL ADMIN
// =====================================================
const deleteHotelAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Find hotel admin
    const adminUser = await User.findOne({
      _id: id,
      role: "hoteladmin",
    });

    if (!adminUser) {
      return res.status(404).json({
        message: "Hotel admin not found",
      });
    }

    // Remove hotel assignment
    await Hotel.updateMany(
      {
        hotelAdmin: adminUser._id,
      },
      {
        $set: {
          hotelAdmin: null,
        },
      },
    );

    // Delete user
    await User.findByIdAndDelete(adminUser._id);

    res.json({
      message: "Hotel admin deleted successfully",
    });
  } catch (error) {
    console.error("DELETE HOTEL ADMIN ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================
module.exports = {
  register,
  login,
  createHotelAdmin,
  getHotelAdmins,
  updateHotelAdmin,
  deleteHotelAdmin,
};
