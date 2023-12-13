// postinstall.js

// postinstall.js
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const User = require(path.join(__dirname, "userModal.js"));
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// Sample content for the files
const controllerContent = `
// userController.js
const User = require(path.join(__dirname, "userModal.js"));
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

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
const express = require('express');
const router = express.Router();
const { userLogin, userRegister } = require("../controller/authController.js");

router.post("/register", userRegister);
router.post("/login", userLogin);

module.exports = router;
`;

const modelContent = `
// userModel.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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

module.exports = userModal;
`;

const configContent = `
// dbConfig.js
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
`;

// Main postinstall script
const folders = ["routes", "models", "controllers", "config"];

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
  {
    folder: "controllers",
    file: "userController.js",
    content: controllerContent,
  },
  { folder: "routes", file: "userRoute.js", content: routeContent },
  { folder: "models", file: "userModel.js", content: modelContent },
  { folder: "config", file: "dbConfig.js", content: configContent },
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
