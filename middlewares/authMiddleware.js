const User = require("../models/userModel");
const Role = require("../models/roleModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded?.id);
        req.user = user;
        next();
      }
    } catch (error) {
      throw new Error("Token được ủy quyền đã hết hạn, vui lòng đăng nhập lại");
    }
  } else {
    throw new Error("Không có token được đính kèm với tiêu đề");
  }
});
const isAdmin = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const adminUser = await User.findOne({ email });
  if (!adminUser.roleID.equals("66619997d75d4bd81c4aa3df")) {
    throw new Error("Bạn không phải là 1 quản trị viên!");
  } else {
    next();
  }
});
const isBrand = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const brandUser = await User.findOne({ email });
  if (!brandUser.roleID.equals("668817f967bc1a52f018759f")) {
    throw new Error("Bạn không phải là 1 đại diện thương hiệu!");
  } else {
    next();
  }
});
const isBA = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const BAUser = await User.findOne({ email });
  if (BAUser.roleID.equals("666199afd75d4bd81c4aa3e5")) {
    throw new Error("Bạn không phải là 1 quản lý thương hiệu!");
  } else {
    next();
  }
});
const isCA = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const CAUser = await User.findOne({ email });
  if (CAUser.roleID.equals("666199bad75d4bd81c4aa3e8")) {
    throw new Error("Bạn không phải là 1 quản lý nội dung!");
  } else {
    next();
  }
});
const isMA = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const MAUser = await User.findOne({ email });
  if (MAUser.roleID.equals("666199c1d75d4bd81c4aa3eb")) {
    throw new Error("Bạn không phải là 1 quản lý truyền thông!");
  } else {
    next();
  }
});
const isBB = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const adminUser = await User.findOne({ email });
  if (!adminUser.roleID.equals("666199ccd75d4bd81c4aa3ee")) {
    throw new Error("Bạn không phải là 1 trợ lý thương hiệu!");
  } else {
    next();
  }
});
const isCC = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const adminUser = await User.findOne({ email });
  if (!adminUser.roleID.equals("666199d4d75d4bd81c4aa3f1")) {
    throw new Error("Bạn không phải là 1 trợ lý nội dung!");
  } else {
    next();
  }
});
const isMM = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const adminUser = await User.findOne({ email });
  if (!adminUser.roleID.equals("666199dbd75d4bd81c4aa3f4")) {
    throw new Error("Bạn không phải là 1 trợ lý truyền thông!");
  } else {
    next();
  }
});
module.exports = {
  authMiddleware,
  isAdmin,
  isBA,
  isCA,
  isMA,
  isBB,
  isCC,
  isMM,
};
