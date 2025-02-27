const Coupon = require("../models/couponModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");
const softDelete = require("../utils/softDelete");

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
        // Parse date fields using moment.js
        ['startDate', 'endDate'].forEach(field => {
            if (req.body[field]) {
                const parsedDate = moment.tz(req.body[field], "DD-MM-YYYY HH:mm:ss Z", "Asia/Ho_Chi_Minh");
                if (!parsedDate.isValid()) throw new Error(`Invalid date format for ${field}`);
                req.body[field] = parsedDate.toDate();  // Convert to native JavaScript Date object
            }
        });

        // Update and return coupon
        const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedCoupon) return res.status(404).json({ message: "Coupon not found" });

        res.json(updatedCoupon);
    } catch (error) {
        res.status(400).json({ message: error.message || 'Failed to update coupon' });
    }
});

const deleteCoupon = asyncHandler(async (req, res) => {
    const {id} = req.params;
    try {
        const deletedCoupon = await softDelete(Coupon, id);

        if (!deletedCoupon) {
            return res.status(404).json({message: "Coupon not found"});
        }
        res.json({message: "Coupon deleted successfully", data: deletedCoupon});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

const getCoupon = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const get1Coupon = await Coupon.findOne({_id: id, isDelete: false});
        res.json(get1Coupon);
    } catch (error) {
        throw new Error(error);
    }
});

const getAllCoupon = asyncHandler(async (req, res) => {
    try {
        const getAllCoupon = await Coupon.find({isDelete: false});
        res.json(getAllCoupon);
    } catch (error) {
        throw new Error(error);
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
