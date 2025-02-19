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
  try {
    const deletedOwner = await softDelete(Owner, id);

    if (!deletedOwner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    res.json({ message: "Owner deleted successfully", data: deletedOwner });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getOwner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const get1Owner = await Owner.findOne({ _id: id, isDelete: false });
    res.json(get1Owner);
  } catch (error) {
    throw new Error(error);
  }
});

const getOwnerByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  validateMongoDbId(userId);

  try {
    const owner = await Owner.findOne({ userId: userId, isDelete: false })
      .populate({
        path: "userId",
        select:
          "-password -tokenId -createdAt -updatedAt -isDelete -roleId -isActive -isVerifiedPhone", // Loại bỏ trường nhạy cảm
      })
      .populate({
        path: "paymentInformationId",
        model: "PaymentInformation",
        select: "-createdAt -updatedAt -isDelete",
      })
      .populate({
        path: "businessInformationId",
        model: "BusinessInformation",
        select: "-createdAt -updatedAt -isDelete",
      });

    if (!owner) {
      return res
        .status(404)
        .json({ message: "Owner not found for this userId" });
    }

    res.json(owner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getAllOwner = async (req, res) => {
  try {
    const getAllOwner = await Owner.find({ isDelete: false });
    res.json(getAllOwner);
  } catch (error) {
    throw new Error(error);
  }
};
module.exports = {
  createOwner,
  updateOwner,
  deleteOwner,
  getOwner,
  getOwnerByUserId,
  getAllOwner,
};
