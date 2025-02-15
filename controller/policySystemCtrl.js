const PolicySystem = require("../models/policySystemModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");

const createPolicySystem = asyncHandler(async (req, res) => {
  try {
    //   const newPolicySystem = await PolicySystem.create(req.body);
    const {
      name,
      policySystemCategoryId,
      policySystemBookingId,
      description,
      value,
      unit,
      startDate,
      endDate,
      isActive,
    } = req.body;

    // Chuyển đổi từ định dạng DD-MM-YYYY sang giờ Việt Nam trước khi lưu
    // const vietnamTime1 = moment
    //   .tz(startDate, "DD-MM-YYYY", "Asia/Ho_Chi_Minh")
    //   .toDate();
    const vietnamTime1 = moment(startDate, "DD-MM-YYYY HH:mm:ss")
      .tz("Asia/Ho_Chi_Minh")
      .toDate();

    // const vietnamTime2 = moment
    //   .tz(endDate, "DD-MM-YYYY", "Asia/Ho_Chi_Minh")
    //   .toDate();
    const vietnamTime2 = moment(endDate, "DD-MM-YYYY HH:mm:ss")
      .tz("Asia/Ho_Chi_Minh")
      .toDate();
    // Kiểm tra điều kiện startDate phải sau ngày tạo hệ thống (createdAt)
    const currentDate = new Date();
    const currentDateVN = moment(currentDate, "DD/MM/YYYY HH:mm:ss")
      .tz("Asia/Ho_Chi_Minh");

    if (vietnamTime1 <= currentDateVN) {
      return res.status(400).json({
        message: "Start date must be after the current date.",
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
      policySystemCategoryId,
      policySystemBookingId,
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
  const {id} = req.params;
    try {
        const deletedPolicySystem = await softDelete(PolicySystem, id);

        if (!deletedPolicySystem) {
            return res.status(404).json({message: "PolicySystem not found"});
        }

        res.json({message: "PolicySystem deleted successfully", data: deletedPolicySystem});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

const getPolicySystem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const get1PolicySystem = await PolicySystem.findOne({_id: id, isDelete: false});
    res.json(get1PolicySystem);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllPolicySystem = asyncHandler(async (req, res) => {
  try {
    const getAllPolicySystem = await PolicySystem.find({isDelete: false});
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
