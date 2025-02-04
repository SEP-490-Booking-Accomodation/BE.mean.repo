const Owner = require("../models/ownerModel");
const Role = require("../models/roleModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const createOwner = asyncHandler(async (req, res) => {
  try {
    const newOwner = await Owner.create(req.body);
    res.json(newOwner);
  } catch (error) {
    throw new Error(error);
  }
});

const updateOwner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateOwner = await Owner.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateOwner);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteOwner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deleteOwner = await Owner.findByIdAndDelete(id);
    res.json(deleteOwner);
  } catch (error) {
    throw new Error(error);
  }
});

const getOwner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const get1Owner = await Owner.findById(id);
    res.json(get1Owner);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllOwner = async (req, res) => {
  try {
    // Lấy danh sách người dùng (User) có roleID phù hợp
    const userList = await User.find({
      roleID: "67927ff7a0a58ce4f7e8e83d",
    }).select("-password");

    // Kiểm tra nếu không có người dùng nào thỏa mãn điều kiện
    if (!userList.length) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }
    // Lọc ra các user hợp lệ và đảm bảo đúng format
    const formattedOwner = userList.map(async (user) => {
      // Tạo mới Customer từ User
      const newOwner = new Owner({
        userId: user._id, // Lưu userId vào bảng Customer
      });

      // Lưu thông tin customer vào bảng Customer
      await newOwner.save();

      // Trả về thông tin đã định dạng từ bảng User
      return {
        userId: new User(user).toJSON(), // Format dữ liệu của User trước khi trả về
      };
    });

    // Đợi tất cả các bản ghi được lưu vào bảng Customer
    const savedOwners = await Promise.all(formattedOwner);

    res.status(200).json({
      success: true,
      data: savedOwners,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOwner,
  updateOwner,
  deleteOwner,
  getOwner,
  getAllOwner,
};
