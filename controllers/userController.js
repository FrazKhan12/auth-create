// userController.js
const User = require("../models/userModal");
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
