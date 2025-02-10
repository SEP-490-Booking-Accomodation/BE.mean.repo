const mongoose = require("mongoose"); // Erase if already required
const bcrypt = require("bcrypt");
const moment = require("moment-timezone");
const crypto = require("crypto");

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    doB: {
      type: Date,
      required: true,
    },
    avatarUrl: [],
    roleID: {
      type: mongoose.Schema.ObjectId,
      ref: "Role",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isVerifiedEmail: {
      type: Boolean,
      default: false,
    },
    isVerifiedPhone: {
      type: Boolean,
      default: false,
    },
    tokenId: {
      type: mongoose.Schema.ObjectId,
      ref: "Token",
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExprires: Date,
    emailVerificationOTP: String,
    emailVerificationExpires: Date,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.createdAt = moment(ret.createdAt)
          .tz("Asia/Ho_Chi_Minh")
          .format("DD/MM/YYYY HH:mm:ss");
        ret.updatedAt = moment(ret.updatedAt)
          .tz("Asia/Ho_Chi_Minh")
          .format("DD/MM/YYYY HH:mm:ss");
        // Chuyển đổi doB sang giờ Việt Nam khi trả về
        if (ret.doB) {
          ret.doB = moment(ret.doB).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY");
        }
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.createdAt = moment(ret.createdAt)
          .tz("Asia/Ho_Chi_Minh")
          .format("DD/MM/YYYY HH:mm:ss");
        ret.updatedAt = moment(ret.updatedAt)
          .tz("Asia/Ho_Chi_Minh")
          .format("DD/MM/YYYY HH:mm:ss");
        // Chuyển đổi doB sang giờ Việt Nam khi trả về
        if (ret.doB) {
          ret.doB = moment(ret.doB).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY");
        }
        return ret;
      },
    },
  }
);

userSchema.pre("save", async function (next) {
  if (this.doB && typeof this.doB === "string") {
    // Chuyển đổi từ định dạng DD-MM-YYYY sang UTC
    this.doB = moment
      .tz(this.doB, "DD-MM-YYYY", "Asia/Ho_Chi_Minh")
      .utc()
      .toDate();
  }
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSaltSync(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.isPasswordMatched = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.createPasswordResetToken = async function () {
  const resettoken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resettoken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 10 minutes
  return resettoken;
};

//Export the model
module.exports = mongoose.model("User", userSchema);
