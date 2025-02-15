const User = require("../models/userModel");
const Token = require("../models/tokenModel");
const Role = require("../models/roleModel")
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const jwt = require("jsonwebtoken");
const moment = require("moment-timezone");
const { generateToken } = require("../config/jwtToken");
const { generateRefreshToken } = require("../config/refreshToken");
const sendEmail = require("./emailCrtl");
const crypto = require("crypto");

//Create a user
const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    // //Create a new User
    // const newUser = await User.create(req.body);
    // res.json(newUser);
    const {
      fullName,
      email,
      password,
      phone,
      doB,
      roleID,
      isActive,
      isVerifiedEmail,
      isVerifiedPhone,
    } = req.body;

    // Chuyển đổi doB từ định dạng DD-MM-YYYY sang giờ Việt Nam trước khi lưu
    const vietnamTime = moment
      .tz(doB, "DD-MM-YYYY", "Asia/Ho_Chi_Minh")
      .toDate();

    // Tiến hành tạo người dùng với doB đã được chuyển đổi
    const newUser = new User({
      fullName,
      email,
      password,
      phone,
      doB: vietnamTime, // Lưu đúng giờ Việt Nam
      roleID,
      isActive,
      isVerifiedEmail,
      isVerifiedPhone,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
  } else {
    //User already exists
    throw new Error("Người dùng đã tồn tại");
  }
});

//Login a user
// const loginUserCtrl = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;
//   //check if user exists or not
//   const findUser = await User.findOne({ email });
//   if (findUser && (await findUser.isPasswordMatched(password))) {
//     const refToken = await generateRefreshToken(findUser?._id);
//     const updateUser = await User.findByIdAndUpdate(
//       findUser.id,
//       {
//         refreshToken: refToken,
//       },
//       { new: true }
//     );
//     res.cookie("refreshToken", refToken, {
//       httpOnly: true,
//       maxAge: 72 * 60 * 60 * 1000,
//     });
//     res.json({
//       _id: findUser?._id,
//       fullName: findUser?.fullName,
//       email: findUser?.email,
//       phoneNumber: findUser?.phoneNumber,
//       value: generateToken(findUser?._id),
//     });
//   } else {
//     throw new Error("Thông tin không hợp lệ");
//   }
// });
const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // Kiểm tra xem người dùng có tồn tại không
  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    // Xóa token cũ nếu có
    await Token.deleteOne({ userId: findUser._id });

    // Tạo access token và refresh token
    const accessToken = generateToken(findUser._id);
    const refreshToken = generateRefreshToken(findUser._id);

    // Lưu token vào bảng Token
    const newToken = await Token.create({
      userId: findUser._id,
      value: accessToken,
      expiredDate: moment().add(1, "hour").toDate(), // Thời hạn 1 giờ cho access token
      refreshToken: refreshToken,
    });

    // Lưu refresh token vào cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000, // 3 ngày
    });

    // Trả về thông tin người dùng và access token
    res.json({
      _id: findUser._id,
      fullName: findUser.fullName,
      email: findUser.email,
      phone: findUser.phone,
      accessToken: accessToken,
    });
  } else {
    throw new Error("Thông tin không hợp lệ");
  }
});


//Logout functionality
// const logout = asyncHandler(async (req, res) => {
//   const cookie = req.cookies;
//   if (!cookie?.refreshToken)
//     throw new Error("Không làm mới Token trong Cookies");
//   const refreshTokenn = cookie.refreshToken;
//   const user = await User.findOne({ refreshTokenn });
//   if (!user) {
//     res.clearCookie("refreshToken", {
//       httpOnly: true,
//       secure: true,
//     });
//     return res.sendStatus(204); //fobidden
//   }
//   await User.findOneAndUpdate(refreshTokenn, {
//     refreshToken: "",
//   });
//   res.clearCookie("refreshToken", {
//     httpOnly: true,
//     secure: true,
//   });
//   res.sendStatus(204); //fobidden
// });
const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken)
    throw new Error("Không làm mới Token trong Cookies");

  const refreshToken = cookie.refreshToken;

  // Xóa token trong bảng Token
  await Token.deleteOne({ refreshToken });

  // Xóa cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204); // No Content
});


//handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken)
    throw new Error("Không làm mới Token trong Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user)
    throw new Error(
      "Không làm mới Token hiện tại trong cơ sở dữ liệu hoặc không phù hợp"
    );
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("Có gì đó sai xót với refresh Token");
    }
    const accessToken = generateToken(user?._id);
    res.json({ accessToken });
  });
});

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongoDbId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatedPassword = await user.save();
    res.json(updatedPassword);
  } else {
    res.json(user);
  }
});

//Forgot Password
const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error("Không tìm thấy người dùng với email này");
  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `Xin chào, vui lòng theo đường dẫn này để thay đổi mật khẩu của bạn. Đường dẫn này khả dụng trong 10 phút kể từ giờ. <a href='http://localhost:5000/api/user/reset-password/${token}'>Nhấn vào đây</a>`;
    const data = {
      to: email,
      text: "Hey User",
      subject: "Forgot Password Link",
      html: resetURL,
    };
    sendEmail(data);
    res.json(token);
  } catch (error) {
    throw new Error(error);
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error(" Token Expired, Please try again later");
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
});

//Get all users
const getAllUser = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find({isDelete: false});
    res.json(getUsers);
  } catch (error) {
    throw new Error(error);
  }
});

//Get a single use
const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getUser = await User.findById(id);
    res.json({
      getUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//Update a user
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateUser);
  } catch (error) {
    throw new Error(error);
  }
});

//Delete a user
const deleteUser = asyncHandler(async (req, res) => {
  const {id} = req.params;
    try {
        const deletedUser = await softDelete(User, id);

        if (!deletedUser) {
            return res.status(404).json({message: "User not found"});
        }

        res.json({message: "User deleted successfully", data: deletedUser});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

//Block user
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const block = await User.findByIdAndUpdate(
      id,
      {
        isActive: false,
      },
      {
        new: true,
      }
    );
    res.status(201).json({
      message: "User block successfully",
      user: block,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//Unlock user
const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const unBlock = await User.findByIdAndUpdate(
      id,
      {
        isActive: true,
      },
      {
        new: true,
      }
    );
    res.status(201).json({
      message: "User active successfully",
      user: unBlock,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createUser,
  loginUserCtrl,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  getAllUser,
  getUser,
  deleteUser,
  updateUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
};
