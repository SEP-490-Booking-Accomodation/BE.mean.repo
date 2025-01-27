const Staff = require("../models/staffModel");
const Role = require("../models/roleModel");
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
    res.json(updateRole);
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
    const get1Staff = await Staff.findById(id);
    res.json(get1Staff);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllStaff = asyncHandler(async (req, res) => {
  try {
    const getStaffUsers = await Role.findOne({ roleName: 'Staff' });
    const getStaffs = await Staff.find({ roleID: getStaffUsers._id });
    res.json(getStaffs);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createStaff,
  updateStaff,
  deleteStaff,
  getStaff,
  getAllStaff,
};
