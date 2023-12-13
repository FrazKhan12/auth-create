const express = require("express");
const router = express.Router();
const { userLogin, userRegister } = require("../controller/authController.js");

router.post("/register", userRegister);
router.post("/login", userLogin);

module.exports = router;
