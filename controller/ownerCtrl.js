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
    const ownerList = await Owner.find()
      .populate({
        path: "userId",
        match: { roleID: "67927ff7a0a58ce4f7e8e83d" },
        select: "-password", // Loại bỏ password khi trả về
      })
      .lean();

    // Lọc ra các user hợp lệ và đảm bảo đúng format
    const formattedOwner = ownerList
      .filter((owner) => owner.userId) // Bỏ các Owner không có user hợp lệ
      .map((owner) => ({
        ...owner,
        userId: owner.userId ? new User(owner.userId).toJSON() : null, // Áp dụng format
      }));

    res.status(200).json({
      success: true,
      data: formattedOwner,
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
