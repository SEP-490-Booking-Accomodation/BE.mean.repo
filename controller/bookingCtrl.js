const Booking = require("../models/bookingModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const softDelete = require("../utils/softDelete");
const Accommodation = require("../models/accommodationModel");
const moment = require("moment-timezone");

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

    const vietnamTime1 = checkInHour
      ? moment(checkInHour, "DD-MM-YYYY HH:mm:ss")
          .tz("Asia/Ho_Chi_Minh")
          .toDate()
      : null;
    const vietnamTime2 = checkOutHour
      ? moment(checkOutHour, "DD-MM-YYYY HH:mm:ss")
          .tz("Asia/Ho_Chi_Minh")
          .toDate()
      : null;
    const vietnamTime3 = confirmDate
      ? moment(confirmDate, "DD-MM-YYYY HH:mm:ss")
          .tz("Asia/Ho_Chi_Minh")
          .toDate()
      : null;
    const vietnamTime4 = completedDate
      ? moment(completedDate, "DD-MM-YYYY HH:mm:ss")
          .tz("Asia/Ho_Chi_Minh")
          .toDate()
      : null;

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

// const updateBooking = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   validateMongoDbId(id);
//   try {
//     const updateBooking = await Booking.findByIdAndUpdate(id, req.body, {
//       new: true,
//     });
//     res.json(updateBooking);
//   } catch (error) {
//     throw new Error(error);
//   }
// });
const updateBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const updateData = { ...req.body };

    if (updateData.checkInHour) {
      updateData.checkInHour = moment(
        updateData.checkInHour,
        "DD-MM-YYYY HH:mm:ss"
      )
        .tz("Asia/Ho_Chi_Minh")
        .toDate();
    }

    if (updateData.checkOutHour) {
      updateData.checkOutHour = moment(
        updateData.checkOutHour,
        "DD-MM-YYYY HH:mm:ss"
      )
        .tz("Asia/Ho_Chi_Minh")
        .toDate();
    }

    if (updateData.confirmDate) {
      updateData.confirmDate = moment(
        updateData.confirmDate,
        "DD-MM-YYYY HH:mm:ss"
      )
        .tz("Asia/Ho_Chi_Minh")
        .toDate();
    }

    if (updateData.completedDate) {
      updateData.completedDate = moment(
        updateData.completedDate,
        "DD-MM-YYYY HH:mm:ss"
      )
        .tz("Asia/Ho_Chi_Minh")
        .toDate();
    }

    const updatedBooking = await Booking.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const deleteBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBooking = await softDelete(Booking, id);

    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Booking deleted successfully", data: deletedBooking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const get1Booking = await Booking.findOne({ _id: id, isDelete: false });
    res.json(get1Booking);
  } catch (error) {
    throw new Error(error);
  }
});

const getBookingsByCustomerId = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  validateMongoDbId(customerId);
  try {
    const bookings = await Booking.find({ customerId, isDelete: false });
    if (bookings.length === 0) {
      return res
        .status(404)
        .json({ message: "No bookings found for this customer" });
    }
    res.json({
      message: "Bookings retrieved successfully",
      bookings,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getBookingsByRentalLocation = asyncHandler(async (req, res) => {
  const { rentalLocationId } = req.params;

  try {
    // 1. Tìm tất cả accommodation theo rentalLocationId
    const accommodations = await Accommodation.find({
      rentalLocationId,
    }).select("_id");
    const accommodationIds = accommodations.map((a) => a._id);

    if (accommodationIds.length === 0) {
      return res
        .status(404)
        .json({ message: "No accommodations found for this rental location." });
    }

    // 2. Lấy tất cả booking liên quan
    const bookings = await Booking.find({
      accommodationId: { $in: accommodationIds },
    })
      .populate("accommodationId")
      .populate({
        path: "customerId",
        populate: { path: "userId", select: "fullName" },
      });

    const formattedBookings = bookings.map((booking, index) => ({
      [`booking_${index + 1}`]: booking,
    }));

    res.status(200).json({
      total: bookings.length,
      bookings: formattedBookings,
    });

  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get bookings", error: error.message });
  }
});

const getAllBooking = asyncHandler(async (req, res) => {
  try {
    const getAllBooking = await Booking.find({ isDelete: false });
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
  getBookingsByCustomerId,
  getBookingsByRentalLocation,
  getAllBooking,
};
