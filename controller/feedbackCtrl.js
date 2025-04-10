const Feedback = require("../models/feedbackModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const softDelete = require("../utils/softDelete");
const Coupon = require("../models/couponModel");
const Booking = require("../models/bookingModel");
const Accommodation = require("../models/accommodationModel");
const { populate } = require("../models/paymentInformationModel");

const createFeedback = asyncHandler(async (req, res) => {
  try {
    const newFeedback = await Feedback.create(req.body);
    res.json(newFeedback);
  } catch (error) {
    throw new Error(error);
  }
});

const updateFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateFeedback = await Feedback.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateFeedback);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deletedFeedback = await softDelete(Feedback, id);
    if (!deletedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    res.json({
      message: "Feedback deleted successfully",
      data: deletedFeedback,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const get1Feedback = await Feedback.findOne({
      _id: id,
      isDelete: false,
    }).populate({
      path: "replyBy",
      model: "Owner",
      select: "-createdAt -updatedAt -isDelete",
      populate: {
        path: "userId",
        select:
          "-password -tokenId -createdAt -updatedAt -isDelete -roleId -isActive -isVerifiedPhone", // Loại bỏ trường nhạy cảm
      },
    });
    res.json(get1Feedback);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllFeedback = asyncHandler(async (req, res) => {
  try {
    const getAllFeedback = await Feedback.find({ isDelete: false })
      .populate({
        path: "replyBy",
        model: "Owner",
        select: "-createdAt -updatedAt -isDelete",
        populate: {
          path: "userId",
          select:
            "-password -tokenId -createdAt -updatedAt -isDelete -roleId -isActive -isVerifiedPhone", // Loại bỏ trường nhạy cảm
        },
      })
      .populate("bookingId");
    res.json(getAllFeedback);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllFeedbackByRentalId = asyncHandler(async (req, res) => {
  const { rentalId } = req.params;
  validateMongoDbId(rentalId);

  try {
    // Tìm tất cả accommodation có rentalId này
    const accommodations = await Accommodation.find({
      rentalLocationId: rentalId,
    }).select("_id");
    const accommodationIds = accommodations.map((acc) => acc._id);

    console.log(accommodationIds);

    // Tìm tất cả bookingId liên quan đến accommodation đó
    const bookings = await Booking.find({
      accommodationId: { $in: accommodationIds },
    }).select("_id");
    const bookingIds = bookings.map((book) => book._id);

    // Lấy feedback theo bookingId
    const feedbacks = await Feedback.find({
      bookingId: { $in: bookingIds },
      isDelete: false,
    })
      .populate({
        path: "replyBy",
        model: "Owner",
        select: "-createdAt -updatedAt -isDelete",
        populate: {
          path: "userId",
          select: "fullName email avatarUrl phone",
        },
      })
      .populate({
        path: "bookingId",
        model: "Booking",
        select: "checkInHour durationBookingHour",
        populate: {
          path: "customerId",
          populate: {
            path: "userId",
            select:
              "-password -tokenId -createdAt -updatedAt -isDelete -roleID -isActive -isVerifiedPhone -isVerifiedEmail",
          },
        },
      });

    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getAverageRatingByRentalId = asyncHandler(async (req, res) => {
  const { rentalId } = req.params;
  validateMongoDbId(rentalId);

  try {
    // Lấy tất cả accommodations thuộc rentalLocationId
    const accommodations = await Accommodation.find({
      rentalLocationId: rentalId,
    }).select("_id");
    const accommodationIds = accommodations.map((acc) => acc._id);

    // Lấy tất cả bookingId liên quan đến accommodations đó
    const bookings = await Booking.find({
      accommodationId: { $in: accommodationIds },
    }).select("_id");
    const bookingIds = bookings.map((book) => book._id);

    // Lấy tất cả feedback có rating theo bookingId
    const feedbacks = await Feedback.find({
      bookingId: { $in: bookingIds },
      isDelete: false,
      rating: { $exists: true },
    }).select("rating");

    if (feedbacks.length === 0) {
      return res.json({
        rentalId,
        averageRating: 0,
        totalFeedbacks: 0,
      });
    }

    // Tính trung bình rating
    const totalRating = feedbacks.reduce(
      (sum, feedback) => sum + feedback.rating,
      0
    );
    const averageRating = totalRating / feedbacks.length;

    res.json({
      rentalId,
      averageRating: parseFloat(averageRating.toFixed(2)), // Làm tròn đến 2 số thập phân
      totalFeedbacks: feedbacks.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getAllFeedbackByCustomerId = asyncHandler(async (req, res) => {
  const { cusId } = req.params;
  validateMongoDbId(cusId);

  try {
    // Lấy tất cả bookings của customer này
    const bookings = await Booking.find({ customerId: cusId }).select(
      "feedbackId"
    );

    console.log(bookings);

    // Lọc ra những feedbackId hợp lệ
    const feedbackIds = bookings.map((b) => b.feedbackId).filter((id) => id); // bỏ undefined/null

    console.log(feedbackIds);
    if (feedbackIds.length === 0) {
      return res.json([]);
    }

    // Tìm feedback theo các ID đã lọc
    const feedbacks = await Feedback.find({
      _id: { $in: feedbackIds },
      isDelete: false,
    })
      // .populate({
      //   path: "replyBy",
      //   model: "Owner",
      //   select: "-createdAt -updatedAt -isDelete",
      //   populate: {
      //     path: "userId",
      //     select: "fullName email avatarUrl phone",
      //   },
      // })
      // .populate({
      //   path: "bookingId",
      //   model: "Booking",
      //   select: "checkInHour durationBookingHour",
      //   populate: {
      //     path: "customerId",
      //     populate: {
      //       path: "userId",
      //       select:
      //         "-password -tokenId -createdAt -updatedAt -isDelete -roleID -isActive -isVerifiedPhone -isVerifiedEmail",
      //     },
      //   },
      // });

    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getAllFeedbackByOwnerId = asyncHandler(async (req, res) => {
  const { ownerId } = req.params;
  validateMongoDbId(ownerId);

  try {
    const feedback = await Feedback.find({
      replyBy: ownerId,
      isDelete: false,
    })
      .populate({
        path: "replyBy",
        model: "Owner",
        select: "-createdAt -updatedAt -isDelete",
        populate: {
          path: "userId",
          select: "fullName email avatarUrl phone", // Loại bỏ trường nhạy cảm
        },
      })
      .populate({
        path: "bookingId",
        model: "Booking",
        select: "checkInHour durationBookingHour",
        populate: {
          path: "customerId",
          populate: {
            path: "userId",
            select:
              "-password -tokenId -createdAt -updatedAt -isDelete -roleID -isActive -isVerifiedPhone -isVerifiedEmail",
          },
        },
      });
    res.json(feedback);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createFeedback,
  updateFeedback,
  deleteFeedback,
  getFeedback,
  getAllFeedback,
  getAllFeedbackByRentalId,
  getAllFeedbackByOwnerId,
  getAllFeedbackByCustomerId,
  getAverageRatingByRentalId,
};
