const RentalLocation = require("../models/rentalLocationModel");
const AccommodationType = require("../models/accommodationTypeModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");
const { isValidObjectId } = require('../utils/mongoose-helpers');
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
    const updateRentalLocation = await RentalLocation.findByIdAndUpdate(id, req.body, {
      new: true,
    });
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

    res.json({ message: "RentalLocation deleted successfully", data: deletedRentalLocation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getRentalLocation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  
  try {
    const rentalLocation = await RentalLocation.findOne({ _id: id, isDelete: false })
      .populate({
        path: 'ownerId',
        populate: [
          {
            path: 'userId',
            match: { 
              roleID: "67927ff7a0a58ce4f7e8e83d",
              isDelete: false,
            },
            select: '-password -createdAt -updatedAt -__v' 
          },
          {
            path: 'businessInformationId',
            select: '-createdAt -updatedAt -__v'
          }
        ],
        select: 'isApproved note'
      })
      .populate({
        path: 'landUsesRightId',
        select: '' // Include the fields you want from LandUsesRight model
      });

    if (!rentalLocation) {
      return res.status(404).json({ success: false, message: "Rental location not found" });
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
          message: "Invalid ownerId format"
        });
      }
      filter.ownerId = ownerId;
    }

    const rentalLocations = await RentalLocation.find(filter)
      .populate({
        path: 'ownerId',
        populate: [
          {
            path: 'userId',
            match: {
              roleID: "67927ff7a0a58ce4f7e8e83d",
            },
            select: 'fullName email phone avatarUrl'
          },
          {
            path: 'businessInformationId',
            select: 'companyName companyAddress taxID'
          }
        ]
      })
      .populate({
        path: 'landUsesRightId',
        select: '' // Include the fields you want from LandUsesRight model
      });

    res.status(200).json({
      success: true,
      data: rentalLocations
    });
  } catch (error) {
    res.status(500).json({
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
      message: "Invalid status value. Status must be 1 (Pending), 2 (Inactive), 3 (Active), 4 (Pause), 5 (Deleted), or 6 (Needs_Update)" 
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
        message: "Rental location not found"
      });
    }
    res.json({
      success: true,
      data: updatedLocation
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
};