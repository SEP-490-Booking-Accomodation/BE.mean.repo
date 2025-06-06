const User = require("../models/userModel");
const Token = require("../models/tokenModel");
const Role = require("../models/roleModel");
const Admin = require("../models/adminModel");
const { Owner } = require("../models/ownerModel");
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
const PolicyOwner = require("../models/policyOwnerModel");
const Value = require("../models/valueModel");

// Định nghĩa các role ID
const ROLE_IDS = {
  admin: "67f87c9ac19b91da666bbdc5",
  owner: "67f87ca3c19b91da666bbdc7",
  customer: "67f87ca8c19b91da666bbdc9",
};

//Create a user
const createUser = asyncHandler(async (req, res) => {
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

  const existingUser = await User.findOne({
    $or: [{ email: email }, { phone: phone }],
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new Error("Email already exists");
    }
    if (existingUser.phone === phone) {
      throw new Error("Phone number already exists");
    }
  }

  // Chuyển đổi doB từ định dạng DD-MM-YYYY sang giờ Việt Nam trước khi lưu
  const vietnamTime = doB
    ? moment(doB, "DD-MM-YYYY").tz("Asia/Ho_Chi_Minh").toDate()
    : null;

  // Tiến hành tạo người dùng với doB đã được chuyển đổi
  const newUser = new User({
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
  });

  await newUser.save();

  // Kiểm tra roleID và lưu vào bảng tương ứng
  if (roleID === ROLE_IDS.admin) {
    await Admin.create({ userId: newUser._id });
  } else if (roleID === ROLE_IDS.owner) {
    const createdOwner = await Owner.create({ userId: newUser._id });
    // Ngày giờ hiện tại tại Việt Nam
    const nowVN = moment().tz("Asia/Ho_Chi_Minh");
    const startDate = nowVN.toDate();
    const endDate = nowVN.add(200, "years").toDate();

    // Tạo policyOwner
    const policyOwner = await PolicyOwner.create({
      ownerId: createdOwner._id,
      policyTitle: "Preparing Room Policy",
      policyDescription: "This policy takes time to prepare the room.",
      startDate,
      endDate,
      isActive: true, // Nếu bạn muốn mặc định active
    });

    // Tạo value tương ứng
    const val = "0";
    const value = await Value.create({
      policyOwnerId: policyOwner._id,
      val,
      description: `${val} minutes clean room`,
      unit: "minutes",
      valueType: "time",
      hashTag: "#pretime",
    });

    // Gắn value vào policyOwner
    policyOwner.values = [value._id];
    await value.save();
    await policyOwner.save();
  } else if (roleID === ROLE_IDS.customer) {
    await Customer.create({ userId: newUser._id });
  }

  // Gửi email cho toàn bộ admin nếu là owner hoặc customer
  if (roleID === ROLE_IDS.owner || roleID === ROLE_IDS.customer) {
    const admins = await Admin.find().populate("userId", "email fullName");

    const adminEmails = admins
      .map((admin) => admin.userId?.email)
      .filter((email) => !!email);

    if (adminEmails.length > 0) {
      await sendEmail({
        to: adminEmails,
        subject: "Yêu cầu xác nhận tài khoản mới",
        text: `Một người dùng mới đã đăng ký với vai trò: ${
          roleID === ROLE_IDS.owner ? "Owner" : "Customer"
        }.`,
        html: `
          <h3>Thông báo đăng ký tài khoản mới</h3>
          <p><b>Họ tên:</b> ${fullName}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Số điện thoại:</b> ${phone}</p>
          <p><b>Vai trò:</b> ${
            roleID === ROLE_IDS.owner ? "Owner" : "Customer"
          }</p>
          <p>Vui lòng đăng nhập hệ thống để xác nhận người dùng này.</p>
        `,
      });
    }
  }

  res.status(201).json({
    message: "User registered successfully",
    user: newUser,
  });
});

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
      refreshToken: refreshToken,
    });
  } else {
    throw new Error("Thông tin không hợp lệ");
  }
});

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

const refreshTokenWithParam = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new Error("Refresh Token is required");
  }

  // Tìm refreshToken trong bảng Token
  const tokenDoc = await Token.findOne({ refreshToken });

  if (!tokenDoc) {
    throw new Error("Invalid or expired Refresh Token");
  }

  // Xác thực refresh token
  jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      await Token.deleteOne({ refreshToken }); // Xóa token nếu không hợp lệ
      throw new Error("Invalid Refresh Token");
    }

    // Tìm user dựa trên userId trong token
    const user = await User.findById(tokenDoc.userId);
    if (!user) {
      await Token.deleteOne({ refreshToken });
      throw new Error("User not found");
    }

    // Tạo access token mới
    const newAccessToken = generateToken(user._id);

    // Cập nhật accessToken mới vào bảng Token
    tokenDoc.value = newAccessToken;
    await tokenDoc.save();

    res.json({
      accessToken: newAccessToken,
    });
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
    const resetURL = `Xin chào, vui lòng theo đường dẫn này để thay đổi mật khẩu của bạn. Đường dẫn này khả dụng trong 10 phút kể từ giờ. <a href='https://mean-dep.vercel.app/set-new-password/${resetToken}'>Nhấn vào đây</a>`;
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
  user.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // Hết hạn sau 10 phút

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
    const users = await User.find().lean(); // dùng .lean() để kết quả là plain JS object

    const userIds = users.map((user) => user._id);

    const [owners, customers, admins] = await Promise.all([
      Owner.find({ userId: { $in: userIds }, isDelete: false }).lean(),
      Customer.find({ userId: { $in: userIds }, isDelete: false }).lean(),
      Admin.find({ userId: { $in: userIds }, isDelete: false }).lean(),
    ]);

    // Tạo map để truy nhanh
    const ownerMap = new Map(owners.map((o) => [String(o.userId), o]));
    const customerMap = new Map(customers.map((c) => [String(c.userId), c]));
    const adminMap = new Map(admins.map((a) => [String(a.userId), a]));

    const enrichedUsers = users.map((user) => {
      const userIdStr = String(user._id);
      return {
        ...user,
        owner: ownerMap.get(userIdStr) || null,
        customer: customerMap.get(userIdStr) || null,
        admin: adminMap.get(userIdStr) || null,
      };
    });

    res.json(enrichedUsers);
  } catch (error) {
    res.status(500).json({
      message: "Error fetch data",
      error: error.message,
    });
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
  refreshTokenWithParam,
  logout,
};
