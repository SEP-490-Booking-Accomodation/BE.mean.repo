const User = require("../models/userModel");
const Token = require("../models/tokenModel");
const Role = require("../models/roleModel");
const Staff = require("../models/staffModel");
const Owner = require("../models/ownerModel");
const Customer = require("../models/customerModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const jwt = require("jsonwebtoken");
const moment = require("moment-timezone");
const { generateToken } = require("../config/jwtToken");
const { generateRefreshToken } = require("../config/refreshToken");
const { sendEmail, sendOTPEmail } = require("./emailCrtl");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const softDelete = require("../utils/softDelete");
const admin = require("../config/firebaseConfig");

// Định nghĩa các role ID
const ROLE_IDS = {
  staff: "67927feaa0a58ce4f7e8e83a",
  owner: "67927ff7a0a58ce4f7e8e83d",
  customer: "67927ffda0a58ce4f7e8e840",
};

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
      avatarUrl,
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
      avatarUrl,
      roleID,
      isActive,
      isVerifiedEmail,
      isVerifiedPhone,
    });

    await newUser.save();

    // Kiểm tra roleID và lưu vào bảng tương ứng
    if (roleID === ROLE_IDS.staff) {
      await Staff.create({ userId: newUser._id });
    } else if (roleID === ROLE_IDS.owner) {
      await Owner.create({ userId: newUser._id });
    } else if (roleID === ROLE_IDS.customer) {
      await Customer.create({ userId: newUser._id });
    }

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

// //handle refresh token
// const handleRefreshToken = asyncHandler(async (req, res) => {
//   const cookie = req.cookies;
//   if (!cookie?.refreshToken)
//     throw new Error("Không làm mới Token trong Cookies");
//   const refreshToken = cookie.refreshToken;
//   const user = await User.findOne({ refreshToken });
//   if (!user)
//     throw new Error(
//       "Không làm mới Token hiện tại trong cơ sở dữ liệu hoặc không phù hợp"
//     );
//   jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
//     if (err || user.id !== decoded.id) {
//       throw new Error("Có gì đó sai xót với refresh Token");
//     }
//     const accessToken = generateToken(user?._id);
//     res.json({ accessToken });
//   });
// });

const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) {
    throw new Error("Không tìm thấy refreshToken trong Cookies");
  }

  const refreshToken = cookie.refreshToken;

  // Tìm refreshToken trong bảng Token
  const tokenDoc = await Token.findOne({ refreshToken });

  if (!tokenDoc) {
    throw new Error("Refresh Token không hợp lệ hoặc đã hết hạn");
  }

  // Xác thực refresh token
  jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      await Token.deleteOne({ refreshToken }); // Xóa token nếu không hợp lệ
      throw new Error("Refresh Token không hợp lệ");
    }

    // Tìm user dựa trên userId trong token
    const user = await User.findById(tokenDoc.userId);
    if (!user) {
      await Token.deleteOne({ refreshToken });
      throw new Error("Người dùng không tồn tại");
    }

    // Tạo access token mới
    const newAccessToken = generateToken(user._id);

    // Cập nhật accessToken mới vào bảng Token
    tokenDoc.value = newAccessToken;
    await tokenDoc.save();

    res.json({ accessToken: newAccessToken });
  });
});

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { currentPassword, newPassword } = req.body;
  validateMongoDbId(_id);
  const user = await User.findById(_id);
  if (!user) {
    return res.status(404).json({ message: "Người dùng không tồn tại" });
  }

  // Kiểm tra mật khẩu cũ
  const isMatch = await user.isPasswordMatched(currentPassword);
  if (!isMatch) {
    return res.status(400).json({ message: "Mật khẩu cũ không chính xác" });
  }

  // // Hash mật khẩu mới
  // const salt = await bcrypt.genSalt(10);
  // user.password = await bcrypt.hash(newPassword, salt);
  // await user.save();

  // Cập nhật mật khẩu mà không hash ở đây
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    message: "Cập nhật mật khẩu thành công",
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
    },
  });
});

//Forgot Password
const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error("Không tìm thấy người dùng với email này");
  try {
    const resetToken = await user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false }); // Lưu token vào DB mà không cần validate các field khác
    const resetURL = `Xin chào, vui lòng theo đường dẫn này để thay đổi mật khẩu của bạn. Đường dẫn này khả dụng trong 10 phút kể từ giờ. <a href='http://localhost:3000/set-new-password/${resetToken}'>Nhấn vào đây</a>`;
    if (!resetToken) {
      throw new Error("Failed to generate reset token");
    }
    const data = {
      to: email,
      text: "Hey User",
      subject: "Forgot Password Link",
      html: resetURL,
    };
    sendEmail(data);
    res.json(resetToken);
  } catch (error) {
    throw new Error(error);
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  // const token = req.params.token;;
  console.log("Received Token from Client:", token); // Debug token
  if (!token) {
    throw new Error("Reset token is required");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  console.log("Hashed Token:", hashedToken); // Debug hashed token

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error(" Token Expired, Please try again later");
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({ validateBeforeSave: false });
  res.json(user);
});

//Gửi OTP
const sendEmailOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Kiểm tra xem người dùng có tồn tại không
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Tạo mã OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 chữ số
  user.emailVerificationOTP = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
  user.emailVerificationExpires = Date.now() + 2 * 60 * 1000; // Hết hạn sau 10 phút

  await user.save();

  // Gửi OTP qua email
  await sendOTPEmail(email, otp);

  res.status(200).json({ message: "OTP sent to email" });
});

//Xác thực OTP
const verifyEmailOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  // Tìm người dùng theo email
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Kiểm tra OTP hợp lệ
  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
  if (
    user.emailVerificationOTP !== hashedOTP ||
    user.emailVerificationExpires < Date.now()
  ) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }

  // Cập nhật trạng thái email đã xác minh
  user.isVerifiedEmail = true;
  user.emailVerificationOTP = undefined;
  user.emailVerificationExpires = undefined;

  await user.save();

  res.status(200).json({ message: "Email verified successfully" });
});

const sendPhoneOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Số điện thoại là bắt buộc" });
    }

    // Firebase không gửi OTP trực tiếp mà cần dùng Firebase Client (trên mobile/web)
    return res.status(200).json({
      message: "Vui lòng sử dụng Firebase SDK trên client để gửi OTP",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const verifyPhoneOTP = async (req, res) => {
  try {
    const { phone, idToken } = req.body; // Firebase gửi ID Token sau khi người dùng nhập OTP

    // Tìm người dùng theo phone
    const user = await User.findOne({ phone });
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (!idToken) {
      return res.status(400).json({ error: "Missing ID Token" });
    }

    // Xác thực token từ Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    user.isVerifiedPhone = true;
    await user.save();

    return res.status(200).json({
      message: "Xác minh số điện thoại thành công",
      phone: decodedToken.phone_number,
      uid: decodedToken.uid,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ error: "Mã OTP không hợp lệ hoặc đã hết hạn" });
  }
};

//Get all users
const getAllUser = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find();
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
// const updateUser = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   validateMongoDbId(id);
//   try {
//     const updateUser = await User.findByIdAndUpdate(id, req.body, {
//       new: true,
//     });
//     res.json(updateUser);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const updateData = { ...req.body };

    // Loại bỏ password và roleId khỏi dữ liệu update nếu có
    delete updateData.password;
    delete updateData.roleId;
    if (updateData.doB) {
      updateData.doB = moment(updateData.doB, "DD-MM-YYYY")
        .tz("Asia/Ho_Chi_Minh")
        .toDate();
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password -roleId");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//Delete a user
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deleteUser = await User.findByIdAndDelete(id);
    res.json({
      deleteUser,
    });
  } catch (error) {
    throw new Error(error);
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
  sendEmailOTP,
  verifyEmailOTP,
  sendPhoneOTP,
  verifyPhoneOTP,
  getAllUser,
  getUser,
  deleteUser,
  updateUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
};
