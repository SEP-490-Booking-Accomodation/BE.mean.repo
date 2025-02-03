const PolicySystem = require("../models/policySystemModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const createPolicySystem = asyncHandler(async (req, res) => {
  try {
    //   const newPolicySystem = await PolicySystem.create(req.body);
    const { name, description, value, unit, startDate, endDate, isActive } =
      req.body;

    // Chuyển đổi từ định dạng DD-MM-YYYY sang giờ Việt Nam trước khi lưu
    const vietnamTime1 = moment
      .tz(startDate, "DD-MM-YYYY", "Asia/Ho_Chi_Minh")
      .toDate();
    const vietnamTime2 = moment
      .tz(endDate, "DD-MM-YYYY", "Asia/Ho_Chi_Minh")
      .toDate();

    // Kiểm tra điều kiện startDate phải sau ngày tạo hệ thống (createdAt)
    const currentDate = new Date();
    if (vietnamTime1 <= currentDate) {
      return res.status(400).json({
        message: "Start date must be after the current date (createdAt).",
      });
    }

    // Kiểm tra điều kiện endDate phải sau startDate
    if (vietnamTime2 <= vietnamTime1) {
      return res.status(400).json({
        message: "End date must be after the start date.",
      });
    }

    const newPolicySystem = new PolicySystem({
      name,
      description,
      value,
      unit,
      startDate: vietnamTime1,
      endDate: vietnamTime2,
      isActive: true,
    });

    await newPolicySystem.save();
    res.status(201).json({
      message: "Policy System created successfully",
      policySystem: newPolicySystem,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const updatePolicySystem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatePolicySystem = await PolicySystem.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    );
    res.json(updatePolicySystem);
  } catch (error) {
    throw new Error(error);
  }
});

const deletePolicySystem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletePolicySystem = await PolicySystem.findByIdAndDelete(id);
    res.json(deletePolicySystem);
  } catch (error) {
    throw new Error(error);
  }
});

const getPolicySystem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const get1PolicySystem = await PolicySystem.findById(id);
    res.json(get1PolicySystem);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllPolicySystem = asyncHandler(async (req, res) => {
  try {
    const getAllPolicySystem = await PolicySystem.find();
    res.json(getAllPolicySystem);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createPolicySystem,
  updatePolicySystem,
  deletePolicySystem,
  getPolicySystem,
  getAllPolicySystem,
};
