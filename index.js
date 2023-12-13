// postinstall.js

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import User from "../model/userModal.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Sample content for the files
const controllerContent = `
// userController.js
import User from "../model/userModal.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const userRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(email);
    const user = await User.findOne({ email });

    if (user) {
      return res.status(200).send({
        message: "email already registered",
        success: false,
      });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(200).send({
      message: "Account created Succesfully",
      success: true,
      data: newUser,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Failed to creat the account",
      success: false,
    });
  }
};
export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).send({
        message: "Email is not registered",
        success: false,
      });
    }
    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      return res.status(200).send({
        message: "Password is wrong",
        success: false,
      });
    } else {
      let token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "30m",
      });
      res.status(200).send({
        message: "Login Succes",
        success: true,
        data: token,
      });
    }
  } catch (error) {
    return res.status(500).send({
      message: "Internal Server Error",
      success: false,
    });
  }
};

`;

const routeContent = `
// userRoute.js
import express from "express";
const router = express.Router();
import { userLogin, userRegister } from "./controller/authController.js";

router.post("/register", userRegister);
router.post("/login", userLogin);

export default router;
`;

const modelContent = `
// userModel.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const schema = mongoose.Schema;

const userSchema = new schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  console.log("pre hook: validate username");

  try {
    if (!this.isModified("password")) {
      console.log("Password not modified, skipping hashing");
      return next();
    } else {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(this.password, salt);
      this.password = hash;

      console.log("database hashed password", this.password);

      return next();
    }
  } catch (error) {
    console.error(error.message);
    return next(error);
  }
});

const userModal = new mongoose.model("users", userSchema);

export default userModal;
`;

const configContent = `
// dbConfig.js
import mongoose from "mongoose";
import dotenv from "dotenv";
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

export default dbConnect;
`;

// Main postinstall script
const folders = ["routes", "model", "controllers", "config"];

folders.forEach((folder) => {
  const folderPath = path.join(__dirname, folder);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
    console.log(`Created ${folder} folder`);
  } else {
    console.log(`${folder} folder already exists`);
  }
});

// Install necessary npm packages
console.log("Installing dependencies...");
execSync("npm install express mongoose nodemon dotenv");

// Create controller, route, and model files with sample content
const filesToCreate = [
  { folder: "config", file: "dbConfig.js", content: configContent },
  { folder: "model", file: "userModal.js", content: modelContent },
  { folder: "routes", file: "userRoute.js", content: routeContent },
  {
    folder: "controllers",
    file: "userController.js",
    content: controllerContent,
  },
];

filesToCreate.forEach(({ folder, file, content }) => {
  const filePath = path.join(__dirname, folder, file);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`Created ${file} in ${folder} folder`);
  } else {
    console.log(`${file} already exists in ${folder} folder`);
  }
});

console.log("Setup complete.");
