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
