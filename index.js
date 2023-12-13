// postinstall.js

// postinstall.js
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const User = require("./models/userModal");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

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
