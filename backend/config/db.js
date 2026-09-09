const mongoose = require("mongoose");

const connectDB = async () => {
  const { MONGO_URI } = process.env;

  if (!MONGO_URI) {
    console.error("MongoDB Connection Failed");
    console.error(
      "Missing MONGO_URI in environment variables. Add a valid MongoDB connection string to .env.",
    );
    process.exit(1);
  }

  if (
    !MONGO_URI.startsWith("mongodb://") &&
    !MONGO_URI.startsWith("mongodb+srv://")
  ) {
    console.error("MongoDB Connection Failed");
    console.error(
      "Invalid MONGO_URI scheme. It must start with 'mongodb://' or 'mongodb+srv://'.",
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Failed");
    console.error(error.message);

    process.exit(1);
  }
};

module.exports = connectDB;
