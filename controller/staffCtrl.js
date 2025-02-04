const Staff = require("../models/staffModel");
const Role = require("../models/roleModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const createStaff = asyncHandler(async (req, res) => {
  try {
    const newStaff = await Staff.create(req.body);
    res.json(newStaff);
  } catch (error) {
    throw new Error(error);
  }
});

const updateStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateStaff = await Staff.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateStaff);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deleteStaff = await Staff.findByIdAndDelete(id);
    res.json(deleteStaff);
  } catch (error) {
    throw new Error(error);
  }
});

const getStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    // const get1Staff = await Staff.findOne({userId: id});
    const staffInfor = await User.findById(id);
    res.json(staffInfor);
  } catch (error) {
    throw new Error(error);
  }
});

// const getAllStaff = asyncHandler(async (req, res) => {
//   try {
//     const getStaffUsers = await Role.findOne({ roleName: "Staff" });
//     const getStaffs = await User.find({ roleID: getStaffUsers._id });

//     // Lưu các Staff vào bảng Owner (nếu chưa có)
//     for (const staff of getStaffs) {
//       const existingStaff = await Staff.findOne({ userId: staff._id });
//       if (!existingStaff) {
//         // Thêm Staff vào bảng Staff nếu chưa tồn tại
//         await Staff.create({ userId: staff._id });
//       }
//     }

//     res.json(getStaffs);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

const getAllStaff = async (req, res) => {
  try {
    // Lấy danh sách người dùng (User) có roleID phù hợp
    const userList = await User.find({
      roleID: "67927feaa0a58ce4f7e8e83a",
    }).select("-password");

    // Kiểm tra nếu không có người dùng nào thỏa mãn điều kiện
    if (!userList.length) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // Lọc ra các user hợp lệ và đảm bảo đúng format
    const formattedStaff = userList.map(async (user) => {
      // Tạo mới Customer từ User
      const newStaff = new Staff({
        userId: user._id, // Lưu userId vào bảng Customer
      });

      // Lưu thông tin customer vào bảng Customer
      await newStaff.save();

      // Trả về thông tin đã định dạng từ bảng User
      return {
        userId: new User(user).toJSON(), // Format dữ liệu của User trước khi trả về
      };
    });

    // Đợi tất cả các bản ghi được lưu vào bảng Customer
    const savedStaffs = await Promise.all(formattedStaff);

    res.status(200).json({
      success: true,
      data: savedStaffs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createStaff,
  updateStaff,
  deleteStaff,
  getStaff,
  getAllStaff,
};
