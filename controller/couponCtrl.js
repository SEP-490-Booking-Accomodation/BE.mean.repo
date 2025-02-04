const Coupon = require("../models/couponModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");

const createCoupon = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      startDate,
      endDate,
      discountBasedOn,
      amount,
      maxDiscount,
      isActive,
    } = req.body;

    const vietnamTime1 = moment(startDate, "DD-MM-YYYY HH:mm:ss")
      .tz("Asia/Ho_Chi_Minh")
      .toDate();
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

    const newCoupon = new Coupon({
      name,
      startDate: vietnamTime1,
      endDate: vietnamTime2,
      discountBasedOn,
      amount,
      maxDiscount,
      isActive: true,
    });
    await newCoupon.save();
    res.status(201).json({
      message: "Coupon created successfully",
      coupon: newCoupon,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateCoupon = await Coupon.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateCoupon);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deleteCoupon = await Coupon.findByIdAndDelete(id);
    res.json(deleteCoupon);
  } catch (error) {
    throw new Error(error);
  }
});

const getCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const get1Coupon = await Coupon.findById(id);
    res.json(get1Coupon);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllCoupon = asyncHandler(async (req, res) => {
  try {
    const getAllCoupon = await Coupon.find();
    res.json(getAllCoupon);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getCoupon,
  getAllCoupon,
};
