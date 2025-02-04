const Booking = require("../models/bookingModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const createBooking = asyncHandler(async (req, res) => {
  try {
    const {
      policySystemBookingId,
      customerId,
      accommodationId,
      couponId,
      feedbackId,
      checkInHour,
      checkOutHour,
      confirmDate,
      paymentMethod,
      paymentStatus,
      downPrice,
      roomPrice,
      adultNumber,
      childNumber,
      durationBookingHour,
      totalPrice,
      isFullPay,
      isPayOnlyDeposit,
      isCancel,
      completedDate,
      haveEKey,
      eKeyNo,
      status,
    } = req.body;

    const vietnamTime1 = moment(checkInHour, "DD-MM-YYYY HH:mm:ss")
      .tz("Asia/Ho_Chi_Minh")
      .toDate();
    const vietnamTime2 = moment(checkOutHour, "DD-MM-YYYY HH:mm:ss")
      .tz("Asia/Ho_Chi_Minh")
      .toDate();
    const vietnamTime3 = moment(confirmDate, "DD-MM-YYYY HH:mm:ss")
      .tz("Asia/Ho_Chi_Minh")
      .toDate();
    const vietnamTime4 = moment(completedDate, "DD-MM-YYYY HH:mm:ss")
      .tz("Asia/Ho_Chi_Minh")
      .toDate();

    const newBooking = new Booking({
      policySystemBookingId,
      customerId,
      accommodationId,
      couponId,
      feedbackId,
      checkInHour: vietnamTime1,
      checkOutHour: vietnamTime2,
      confirmDate: vietnamTime3,
      paymentMethod,
      paymentStatus,
      downPrice,
      roomPrice,
      adultNumber,
      childNumber,
      durationBookingHour,
      totalPrice,
      isFullPay,
      isPayOnlyDeposit,
      isCancel,
      completedDate: vietnamTime4,
      haveEKey,
      eKeyNo,
      status,
    });
    await newBooking.save();
    res.status(201).json({
      message: "Policy System created successfully",
      booking: newBooking,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const updateBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateBooking = await Booking.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateBooking);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deleteBooking = await Booking.findByIdAndDelete(id);
    res.json(deleteBooking);
  } catch (error) {
    throw new Error(error);
  }
});

const getBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const get1Booking = await Booking.findById(id);
    res.json(get1Booking);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllBooking = asyncHandler(async (req, res) => {
  try {
    const getAllBooking = await Booking.find();
    res.json(getAllBooking);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createBooking,
  updateBooking,
  deleteBooking,
  getBooking,
  getAllBooking,
};
