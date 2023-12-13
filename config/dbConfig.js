const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const dbConnect = async () => {
  try {
    const data = await mongoose.connect(process.env.MONGO_URI);
    if (data) {
      console.log("Database connected successfully");
    }
  } catch (error) {
    console.log("Database connection error");
  }
};

module.exports = dbConnect;
