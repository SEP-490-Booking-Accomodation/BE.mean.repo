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
  if (!adminUser.roleID.equals("67f87c9ac19b91da666bbdc5")) {
    throw new Error("Bạn không phải là 1 quản trị viên!");
  } else {
    next();
  }
});
const isOwner = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const brandUser = await User.findOne({ email });
  if (!brandUser.roleID.equals("67f87ca3c19b91da666bbdc7")) {
    throw new Error("Bạn không phải là 1 đại diện!");
  } else {
    next();
  }
});
const isCustomer = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const BAUser = await User.findOne({ email });
  if (!BAUser.roleID.equals("67f87ca8c19b91da666bbdc9")) {
    throw new Error("Bạn không phải là 1 người dùng!");
  } else {
    next();
  }
});
const isNotGuest = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const user = await User.findOne({ email });
  if (user.roleID.equals("67f87cadc19b91da666bbdcb")) {
    throw new Error("Bạn không có quyền truy cập!");
  } else {
    next();
  }
});
const isCusAndOwner = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const user = await User.findOne({ email });
  if (
    !user.roleID.equals("67f87ca3c19b91da666bbdc7") &&
    !user.roleID.equals("67f87ca8c19b91da666bbdc9")
  ) {
    throw new Error("Bạn không phải là 1 người dùng hoặc đại diện!");
  } else {
    next();
  }
});
const isAdminAndOwner = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const user = await User.findOne({ email });
  if (
    !user.roleID.equals("67f87c9ac19b91da666bbdc5") &&
    !user.roleID.equals("67f87ca3c19b91da666bbdc7")
  ) {
    throw new Error("Bạn không phải là 1 quản trị viên hoặc đại diện!");
  } else {
    next();
  }
});

module.exports = {
  authMiddleware,
  isAdmin,
  isOwner,
  isCustomer,
  isNotGuest,
  isCusAndOwner,
  isAdminAndOwner,
};
