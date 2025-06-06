const Coupon = require("../models/couponModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");
const softDelete = require("../utils/softDelete");
const parseDateFields = require("../utils/parseDateFields");
const checkAndDeactivateCouponIfExpired = require("../utils/checkAndDeactivateCouponIfExpired");
const deactivateExpiredCoupons = require("../utils/deactivateExpiredCoupons");

const createCoupon = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      couponCode,
      startDate,
      endDate,
      discountBasedOn,
      amount,
      maxDiscount,
      isActive,
    } = req.body;

    const vietnamTime1 = startDate
      ? moment.tz(startDate, "DD-MM-YYYY HH:mm:ss", "Asia/Ho_Chi_Minh").toDate()
      : null;
    const vietnamTime2 = endDate
      ? moment.tz(endDate, "DD-MM-YYYY HH:mm:ss", "Asia/Ho_Chi_Minh").toDate()
      : null;

    // Kiểm tra điều kiện startDate phải sau ngày tạo hệ thống (createdAt)
    const currentDate = new Date();
    const currentDateVN = currentDate
      ? moment
          .tz(currentDate, "DD-MM-YYYY HH:mm:ss", "Asia/Ho_Chi_Minh")
          .toDate()
      : null;

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
      couponCode,
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
    const { message } = await deactivateExpiredCoupons();
    console.log("[Coupon Deactivation]", message);

    // Copy the body and delete timestamps
    const data = { ...req.body };
    delete data.createdAt;
    delete data.updatedAt;

    // Parse date fields using the helper function
    parseDateFields(
      data,
      ["startDate", "endDate"],
      "DD-MM-YYYY HH:mm:ss Z",
      "Asia/Ho_Chi_Minh"
    );

    // Update and return coupon
    let updatedCoupon = await Coupon.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (!updatedCoupon)
      return res.status(404).json({ message: "Coupon not found" });

    res.json({ message, coupon: updatedCoupon });
  } catch (error) {
    res
      .status(400)
      .json({ message: error.message || "Failed to update coupon" });
  }
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCoupon = await softDelete(Coupon, id);

    if (!deletedCoupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.json({ message: "Coupon deleted successfully", data: deletedCoupon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const { message } = await deactivateExpiredCoupons();
    console.log("[Coupon Deactivation]", message);

    const coupon = await Coupon.findOne({ _id: id, isDelete: false });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    res.json({ message, coupon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getAllCoupon = asyncHandler(async (req, res) => {
  try {
    const { message } = await deactivateExpiredCoupons();
    console.log("[Coupon Deactivation]", message);

    const getAllCoupon = await Coupon.find({ isDelete: false });

    res.json({ message, coupons: getAllCoupon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const deactivateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deactivatedCoupon = await Coupon.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!deactivatedCoupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.json({
      message: "Coupon deactivated successfully",
      data: deactivatedCoupon,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getCoupon,
  getAllCoupon,
  deactivateCoupon,
};
