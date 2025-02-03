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

const getAllOwner = asyncHandler(async (req, res) => {
  try {
    const getOwnerUsers = await Role.findOne({ roleName: "Owner" });
    const getOwners = await User.find({ roleID: getOwnerUsers._id });

    // Lưu các Owner vào bảng Owner (nếu chưa có)
    for (const owner of getOwners) {
      const existingOwner = await Owner.findOne({ userId: owner._id });
      if (!existingOwner) {
        // Thêm Owner vào bảng Owner nếu chưa tồn tại
        await Owner.create({ userId: owner._id });
      }
    }

    res.json(getOwners);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createOwner,
  updateOwner,
  deleteOwner,
  getOwner,
  getAllOwner,
};
