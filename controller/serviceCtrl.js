const Service = require("../models/serviceModel");
const AccommodationType = require("../models/accommodationTypeModel");
const {RentalLocation} = require("../models/rentalLocationModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");
const softDelete = require("../utils/softDelete");
const { isValidObjectId } = require("../utils/mongoose-helpers");

const createService = asyncHandler(async (req, res) => {
  try {
    const newService = await Service.create(req.body);
    res.json(newService);
  } catch (error) {
    throw new Error(error);
  }
});
const updateService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateService = await Service.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateService);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deletedService = await softDelete(Service, id);

    if (!deletedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json({ message: "Service deleted successfully", data: deletedService });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getService = await Service.findOne({ _id: id, isDelete: false })
        .populate('ownerId');
    res.json(getService);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllService = asyncHandler(async (req, res) => {
  try {
    const { rentalLocationId, ownerId } = req.query;
    let filter = { isDelete: false };
    let serviceIds = [];
    let shouldFilterByServiceIds = false;

    // Handle ownerId filter if provided
    if (ownerId) {
      if (!isValidObjectId(ownerId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ownerId format",
        });
      }

      // Find services directly by ownerId
      filter.ownerId = ownerId;
    }

    // Handle rentalLocationId filter if provided
    if (rentalLocationId) {
      if (!isValidObjectId(rentalLocationId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid rentalLocationId format",
        });
      }

      // Find the rental location
      const rentalLocation = await RentalLocation.findOne({
        _id: rentalLocationId,
        isDelete: false,
      });

      if (!rentalLocation) {
        return res.status(404).json({
          success: false,
          message: "Rental location not found",
        });
      }

      // Get accommodation type IDs from the rental location
      const accommodationTypeIds = rentalLocation.accommodationTypeIds || [];

      if (!accommodationTypeIds.length) {
        return res.status(404).json({
          success: false,
          message: "No accommodation types found for this rental location",
        });
      }

      // Get all accommodation types by their IDs
      const accommodationTypes = await AccommodationType.find({
        _id: { $in: accommodationTypeIds },
        isDelete: false,
      });

      if (!accommodationTypes.length) {
        return res.status(404).json({
          success: false,
          message: "No valid accommodation types found",
        });
      }

      // Collect all serviceIds from these accommodation types
      accommodationTypes.forEach((type) => {
        if (type.serviceIds && type.serviceIds.length > 0) {
          serviceIds = [...serviceIds, ...type.serviceIds];
        }
      });

      if (!serviceIds.length) {
        return res.status(404).json({
          success: false,
          message: "No services found for these accommodation types",
        });
      }

      shouldFilterByServiceIds = true;
    }

    // Add serviceIds filter if needed
    if (shouldFilterByServiceIds) {
      // If we already have ownerId filter, we need to combine with AND
      if (filter.ownerId) {
        filter._id = { $in: serviceIds };
      } else {
        filter._id = { $in: serviceIds };
      }
    }

    // Fetch services based on the final filter
    const services = await Service.find(filter).populate('ownerId');

    if (!services.length) {
      return res.status(404).json({
        success: false,
        message: "No services found with the specified criteria",
      });
    }

    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
});

module.exports = {
  createService,
  updateService,
  deleteService,
  getService,
  getAllService,
};
