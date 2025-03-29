const AccommodationType = require("../models/accommodationTypeModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");
const softDelete = require("../utils/softDelete");
const Accommodation = require("../models/accommodationModel");
const Service = require("../models/serviceModel");

const createAccommodationType = asyncHandler(async (req, res) => {
  try {
    const newAccommodationType = await AccommodationType.create(req.body);
    res.json(newAccommodationType);
  } catch (error) {
    throw new Error(error);
  }
});
const updateAccommodationType = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateAccommodationType = await AccommodationType.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    );
    res.json(updateAccommodationType);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteAccommodationType = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const deletedAccommodationType = await softDelete(AccommodationType, id);

    if (!deletedAccommodationType) {
      return res.status(404).json({ message: "AccommodationType not found" });
    }

    res.json({
      message: "AccommodationType deleted successfully",
      data: deletedAccommodationType,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getAccommodationType = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const accommodationType = await AccommodationType.findOne({
      _id: id,
      isDelete: false,
    }).populate("rentalLocationId", "_id name");

    if (!accommodationType) {
      return res.status(404).json({
        success: false,
        message: "Accommodation type not found",
      });
    }
    const formattedAccommodationType = accommodationType.toJSON();

    const serviceIds = await Service.find({
      accommodationTypeId: id,
      isDelete: false,
    }).select("_id name description status");

    formattedAccommodationType.serviceIds = serviceIds;

    res.status(200).json({
      success: true,
      data: formattedAccommodationType,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
});

const getAllAccommodationType = asyncHandler(async (req, res) => {
  try {
    // First get all accommodation types
    const accommodationTypes = await AccommodationType.find({
      isDelete: false,
    }).populate("rentalLocationId", "_id name");

    // Get formatted accommodation types with empty serviceIds array
    const formattedAccommodationTypes = await Promise.all(
      accommodationTypes.map(async (doc) => {
        const docObj = doc.toJSON();

        // Find all services that reference this accommodation type
        const serviceIds = await Service.find({
          accommodationTypeId: doc._id,
          isDelete: false,
        }).select("_id name description status");

        // Add services to the accommodation type object
        docObj.serviceIds = serviceIds;

        return docObj;
      })
    );

    res.status(200).json({
      success: true,
      data: formattedAccommodationTypes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
});

module.exports = {
  createAccommodationType,
  updateAccommodationType,
  deleteAccommodationType,
  getAccommodationType,
  getAllAccommodationType,
};
