const RentalLocation = require("../models/rentalLocationModel");
const Accommodation = require("../models/accommodationModel");
const AccommodationType = require("../models/accommodationTypeModel");
const Feedback = require("../models/feedbackModel");
const Booking = require("../models/bookingModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");
const { isValidObjectId } = require("../utils/mongoose-helpers");
const softDelete = require("../utils/softDelete");

const createRentalLocation = asyncHandler(async (req, res) => {
  try {
    const newRentalLocation = await RentalLocation.create(req.body);
    res.json(newRentalLocation);
  } catch (error) {
    throw new Error(error);
  }
});
const updateRentalLocation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateRentalLocation = await RentalLocation.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    );
    res.json(updateRentalLocation);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteRentalLocation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deletedRentalLocation = await softDelete(RentalLocation, id);

    if (!deletedRentalLocation) {
      return res.status(404).json({ message: "RentalLocation not found" });
    }

    res.json({
      message: "RentalLocation deleted successfully",
      data: deletedRentalLocation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getRentalLocation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const rentalLocation = await RentalLocation.findOne({
      _id: id,
      isDelete: false,
    })
      .populate({
        path: "ownerId",
        populate: [
          {
            path: "userId",
            match: {
              roleID: "67927ff7a0a58ce4f7e8e83d",
              isDelete: false,
            },
            select: "-password -createdAt -updatedAt -__v",
          },
          {
            path: "businessInformationId",
            select: "-createdAt -updatedAt -__v",
          },
        ],
        select: "isApproved note",
      })
      .populate({
        path: "landUsesRightId",
        select: "", // Include the fields you want from LandUsesRight model
      });

    if (!rentalLocation) {
      return res
        .status(404)
        .json({ success: false, message: "Rental location not found" });
    }

    res.json({ success: true, data: rentalLocation });
  } catch (error) {
    throw new Error(error);
  }
});

const getAllAccommodationTypeOfRentalLocation = asyncHandler(
  async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const rentalLocation = await RentalLocation.findOne({
        _id: id,
        isDelete: false,
      }).populate({
        path: "ownerId",
        select: "-createdAt -updatedAt -isDelete",
        populate: { path: "userId", select: "fullName" },
      });

      const formattedRentalLocations = rentalLocation.toJSON();

      console.log(id);
      const accommodationTypeIds = await AccommodationType.find({
        rentalLocationId: id,
        isDelete: false,
      }).populate({
        path: "serviceIds",
        select: "name",
      });

      // Đếm số lượng accommodationTypeIds trước
      const accommodationTypeCount = await AccommodationType.countDocuments({
        rentalLocationId: id,
        isDelete: false,
      });

      formattedRentalLocations.accommodationTypeIds = {
        count: accommodationTypeCount,
        data: accommodationTypeIds,
      };

      res.status(200).json({
        success: true,
        data: formattedRentalLocations,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
);

const getAllRentalLocation = asyncHandler(async (req, res) => {
  try {
    const { ownerId } = req.query;

    const filter = { isDelete: false };
    if (ownerId) {
      if (!isValidObjectId(ownerId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ownerId format",
        });
      }
      filter.ownerId = ownerId;
    }

    const rentalLocations = await RentalLocation.find(filter)
      .populate({
        path: "ownerId",
        populate: [
          {
            path: "userId",
            match: {
              roleID: "67927ff7a0a58ce4f7e8e83d",
            },
            select: "fullName email phone avatarUrl",
          },
          {
            path: "businessInformationId",
            select: "companyName companyAddress taxID",
          },
        ],
      })
      .populate({
        path: "landUsesRightId",
        select: "", // Include the fields you want from LandUsesRight model
      });

    res.status(200).json({
      success: true,
      data: rentalLocations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
});

const getAllRentalLocationHaveRating = asyncHandler(async (req, res) => {
  try {
    const { ownerId } = req.query;

    const filter = { isDelete: false };
    if (ownerId) {
      if (!isValidObjectId(ownerId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ownerId format",
        });
      }
      filter.ownerId = ownerId;
    }

    // Lấy danh sách rental locations
    const rentalLocations = await RentalLocation.find(filter)
      .populate({
        path: "ownerId",
        populate: [
          {
            path: "userId",
            match: { roleID: "67927ff7a0a58ce4f7e8e83d" },
            select: "fullName email phone avatarUrl",
          },
          {
            path: "businessInformationId",
            select: "companyName companyAddress taxID",
          },
        ],
      })
      .populate({
        path: "landUsesRightId",
        select: "",
      });

    if (!rentalLocations.length) {
      return res
        .status(404)
        .json({ success: false, message: "No rental locations found" });
    }

    // Trích xuất danh sách rentalLocationId
    const rentalLocationIds = rentalLocations.map((loc) => loc._id);
    console.log("Rental Location IDs:", rentalLocationIds);

    // Lấy tất cả accommodations theo rentalLocationId
    const accommodations = await Accommodation.find({
      rentalLocationId: { $in: rentalLocationIds },
    }).select("_id rentalLocationId");

    if (!accommodations.length) {
      return res
        .status(200)
        .json({
          success: true,
          data: rentalLocations.map((loc) => ({
            ...loc.toObject(),
            averageRating: 0,
            totalFeedbacks: 0,
          })),
        });
    }

    console.log("Accommodations:", accommodations);

    // Tạo map cho accommodationId -> rentalLocationId
    const accommodationToRentalMap = new Map();
    accommodations.forEach((acc) => {
      accommodationToRentalMap.set(
        acc._id.toString(),
        acc.rentalLocationId.toString()
      );
    });

    // Lấy tất cả bookingId liên quan đến accommodations
    const bookings = await Booking.find({
      accommodationId: { $in: accommodations.map((acc) => acc._id) },
    }).select("_id accommodationId");

    if (!bookings.length) {
      return res
        .status(200)
        .json({
          success: true,
          data: rentalLocations.map((loc) => ({
            ...loc.toObject(),
            averageRating: 0,
            totalFeedbacks: 0,
          })),
        });
    }

    console.log("Bookings:", bookings);

    // Tạo map bookingId -> rentalLocationId
    const bookingToRentalMap = new Map();
    bookings.forEach((book) => {
      if (accommodationToRentalMap.has(book.accommodationId.toString())) {
        bookingToRentalMap.set(
          book._id.toString(),
          accommodationToRentalMap.get(book.accommodationId.toString())
        );
      }
    });

    // Lấy tất cả feedback có rating theo bookingId
    const feedbacks = await Feedback.find({
      isDelete: false,
      rating: { $exists: true },
      bookingId: { $in: Array.from(bookingToRentalMap.keys()) },
    }).select("rating bookingId");

    if (!feedbacks.length) {
      return res
        .status(200)
        .json({
          success: true,
          data: rentalLocations.map((loc) => ({
            ...loc.toObject(),
            averageRating: 0,
            totalFeedbacks: 0,
          })),
        });
    }

    console.log("Feedbacks:", feedbacks);

    // Tính trung bình rating theo rentalId
    const rentalRatingMap = new Map();
    feedbacks.forEach((fb) => {
      const rentalId = bookingToRentalMap.get(fb.bookingId.toString());
      if (!rentalId) return;

      if (!rentalRatingMap.has(rentalId)) {
        rentalRatingMap.set(rentalId, { totalRating: 0, count: 0 });
      }
      const ratingInfo = rentalRatingMap.get(rentalId);
      ratingInfo.totalRating += fb.rating;
      ratingInfo.count += 1;
      rentalRatingMap.set(rentalId, ratingInfo);
    });

    console.log("Rental Rating Map:", rentalRatingMap);

    // Gắn rating vào rentalLocations
    const rentalData = rentalLocations.map((rental) => {
      const rentalIdStr = rental._id.toString();
      const ratingInfo = rentalRatingMap.get(rentalIdStr) || {
        totalRating: 0,
        count: 0,
      };

      return {
        ...rental.toObject(),
        averageRating: ratingInfo.count
          ? parseFloat((ratingInfo.totalRating / ratingInfo.count).toFixed(2))
          : 0,
        totalFeedbacks: ratingInfo.count,
      };
    });

    res.status(200).json({ success: true, data: rentalData });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Internal Server Error",
      });
  }
});

const updateRentalLocationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  validateMongoDbId(id);

  if (![1, 2, 3, 4].includes(status)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid status value. Status must be 1 (Pending), 2 (Inactive), 3 (Active), 4 (Pause), 5 (Deleted), or 6 (Needs_Update)",
    });
  }

  try {
    const updatedLocation = await RentalLocation.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );

    if (!updatedLocation) {
      return res.status(404).json({
        success: false,
        message: "Rental location not found",
      });
    }
    res.json({
      success: true,
      data: updatedLocation,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createRentalLocation,
  updateRentalLocation,
  deleteRentalLocation,
  getRentalLocation,
  getAllRentalLocation,
  updateRentalLocationStatus,
  getAllAccommodationTypeOfRentalLocation,
  getAllRentalLocationHaveRating,
};
