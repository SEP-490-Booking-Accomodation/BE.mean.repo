const Value = require("../models/valueModel");
const Role = require("../models/roleModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const softDelete = require("../utils/softDelete");

const createValue = asyncHandler(async (req, res) => {
  try {
    const newValue = await Value.create(req.body);
    res.json(newValue);
  } catch (error) {
    throw new Error(error);
  }
});

const updateValue = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateValue = await Value.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateValue);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteValue = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deletedValue = await softDelete(Value, id);

    if (!deletedValue) {
      return res.status(404).json({ message: "Value not found" });
    }

    res.json({ message: "Value deleted successfully", data: deletedValue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getValue = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const get1Value = await Value.findOne({ _id: id, isDelete: false });
    res.json(get1Value);
  } catch (error) {
    throw new Error(error);
  }
});

const getValueById = asyncHandler(async (req, res) => {
  const { valueId } = req.params;
  validateMongoDbId(valueId);

  try {
    const Value = await Value.findOne({
      valueId: valueId,
      isDelete: false,
    }).populate({
      path: "PolicyOwner",
      select: "-createdAt -updatedAt -isDelete",
    });

    if (!Value) {
      return res
        .status(404)
        .json({ message: "Value not found for this valueId" });
    }

    res.json(Value);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getAllValue = async (req, res) => {
  try {
    const getAllValue = await Value.find({ isDelete: false }).populate({
      path: "policyOwnerId",
      select: "-createdAt -updatedAt -isDelete",
    //   populate: { path: "userId", select: "fullName" },
    });
    res.json(getAllValue);
  } catch (error) {
    throw new Error(error);
  }
};
module.exports = {
  createValue,
  updateValue,
  deleteValue,
  getValue,
  getValueById,
  getAllValue,
};
