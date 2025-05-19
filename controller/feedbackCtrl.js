const Feedback = require("../models/feedbackModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const softDelete = require("../utils/softDelete");
const Coupon = require("../models/couponModel");
const Booking = require("../models/bookingModel");
const Accommodation = require("../models/accommodationModel");
const AccommodationType = require("../models/accommodationTypeModel");
const {RentalLocation} = require("../models/rentalLocationModel");

const createFeedback = asyncHandler(async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const existingFeedback = await Feedback.findOne({
      bookingId,
      isDelete: false,
    });
    if (existingFeedback) {
      return res.status(400).json({ message: "Booking Id already exists" });
    }

    const newFeedback = await Feedback.create(req.body);

    booking.feedbackId = newFeedback._id;
    await booking.save();

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
    }).populate({
      path: "bookingId",
      model: "Booking",
      select: "checkInHour durationBookingHour accommodationId",
      populate: [
        {
          path: "customerId",
          populate: {
            path: "userId",
            select:
              "-password -tokenId -createdAt -updatedAt -isDelete -roleID -isActive -isVerifiedPhone -isVerifiedEmail",
          },
        },
        {
          path: "accommodationId",
          select: "accommodationTypeId rentalLocationId",
          populate: [
            {
              path: "accommodationTypeId",
              select: "name", // => accommodationTypeName
            },
            {
              path: "rentalLocationId",
              select: "name city", // => rentalLocationName, rentalLocationCity
            },
          ],
        },
      ],
    });
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

const getAllFeedbackByOwnerId = async (req, res) => {
  try {
    const { ownerId } = req.params;

    // Lấy danh sách accommodationTypeId thuộc về rentalLocation của owner này
    const rentalLocations = await RentalLocation.find({
      ownerId,
      isDelete: false,
    }).select("accommodationTypeIds");

    console.log("Rental Locations of Owner:", rentalLocations);

    // Gom tất cả accommodationTypeId thành một mảng phẳng
    const accommodationTypeIds = rentalLocations
      .flatMap((r) => r.accommodationTypeIds)
      .map((id) => id.toString());
    
    console.log(
      "AccommodationTypeIds from RentalLocations:",
      accommodationTypeIds
    );

    // Tìm tất cả bookings có feedback, không bị xóa, và accommodation thuộc accommodationTypeIds của owner
    const bookings = await Booking.find({
      isDelete: false,
      feedbackId: { $ne: null },
    })
      .populate("feedbackId")
      .populate({
        path: "accommodationId",
        match: {
          accommodationTypeId: { $in: accommodationTypeIds },
        },
        select: "accommodationTypeId",
      });
    
    console.log("Bookings found:", bookings.length);
    bookings.forEach((b, i) => {
      console.log(`Booking ${i + 1}:`, {
        accommodationId: b.accommodationId?._id,
        accommodationTypeId: b.accommodationId?.accommodationTypeId,
        feedback: b.feedbackId,
      });
    });

    // Lọc các booking hợp lệ (vì match không loại bỏ object, chỉ null hóa)
    const feedbackIds = bookings
      .filter((b) => b.accommodationId !== null)
      .map((b) => b.feedbackId);

    const feedbacks = await Feedback.find({
      _id: { $in: feedbackIds },
      isDelete: false,
    })
      .populate({
        path: "bookingId",
        select:
          "-createdAt -updatedAt -__v -isDelete -isDelete -feedbackId -checkInHour -checkOutHour -confirmDate -paymentMethod -paymentStatus -adultNumber -basePrice -overtimeHourlyPrice -childNumber -durationBookingHour -totalPrice -note -timeExpireRefund -status", // bỏ ở cấp booking
        populate: [
          {
            path: "accommodationId",
            select: "-createdAt -updatedAt -__v -isDelete", // bỏ ở cấp accommodation
            populate: {
              path: "rentalLocationId",
              select:
                "-createdAt -updatedAt -__v -_id -accommodationTypeIds -status -image -description -address -longitude -latitude -openHour -closeHour -isOverNight -isDelete -ward -district -city", // bỏ thêm _id nếu không muốn
            },
          },
          {
            path: "customerId",
            select: "-createdAt -updatedAt -__v -isDelete",
            populate: {
              path: "userId",
              select:
                "-createdAt -updatedAt -__v -_id -email -password -phone -doB -avatarUrl -roleID -isActive -isVerifiedEmail -isVerifiedPhone -isDelete", // chỉ lấy các field cần
            },
          },
        ],
      })
      .lean();

    return res.status(200).json({
      success: true,
      data: feedbacks,
    });
  } catch (error) {
    console.error("Error in getAllFeedbackByOwnerId:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy feedback theo ownerId",
    });
  }
};

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
