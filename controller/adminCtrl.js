const Staff = require("../models/adminModel");
const Role = require("../models/roleModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const softDelete = require("../utils/softDelete");

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
  try {
    const deletedStaff = await softDelete(Staff, id);

    if (!deletedStaff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    res.json({ message: "Staff deleted successfully", data: deletedStaff });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const staffInfor = await Staff.findOne({ userId: id, isDelete: false });
    // const staffInfor = await User.findOne({ _id: id, isDelete: false });
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
    // Lấy tất cả khách hàng chưa bị xóa
    const staffs = await Staff.find({ isDelete: false });

    // Duyệt qua từng Staff để kiểm tra sự tồn tại của userId trong bảng User
    for (const staff of staffs) {
      const userExists = await User.findById(staff.userId);
      if (!userExists) {
        // Xóa mềm nếu không tìm thấy User tương ứng
        await softDelete(Staff, staff._id);
      }
    }

    // Lấy lại danh sách khách hàng sau khi đã xoá những Staff không có User
    const updatedStaffs = await Staff.find({ isDelete: false });

    res.json(updatedStaffs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createStaff,
  updateStaff,
  deleteStaff,
  getStaff,
  getAllStaff,
};
