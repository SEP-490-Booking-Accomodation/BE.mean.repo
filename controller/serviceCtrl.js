const Service = require("../models/serviceModel");
const AccommodationType= require("../models/accommodationTypeModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");
const softDelete = require("../utils/softDelete");
const { isValidObjectId } = require('../utils/mongoose-helpers');

const createService= asyncHandler(async(req, res) => {
    try{
        const newService = await Service.create(req.body);
        res.json(newService);
    } catch (error){
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
  const {id} = req.params;
  try {
      const deletedService = await softDelete(Service, id);

      if (!deletedService) {
          return res.status(404).json({message: "Service not found"});
      }

      res.json({message: "Service deleted successfully", data: deletedService});
  } catch (error) {
      res.status(500).json({message: error.message});
  }
});
  
const getService= asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const getService = await Service.findOne({_id: id, isDelete: false});
      res.json(getService);
    } catch (error) {
      throw new Error(error);
    }
});

const getAllService = asyncHandler(async (req, res) => {
  try {
    const { rentalLocationId } = req.query; // Get rentalLocationId from query params
    
    let filter = { isDelete: false }; // Initialize filter with common condition

    if (rentalLocationId) {
      if (!isValidObjectId(rentalLocationId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid rentalLocationId format"
        });
      }

      // Find accommodation types for the given rentalLocationId
      const accommodationTypes = await AccommodationType.find({
        rentalLocationId,
        isDelete: false
      });

      if (!accommodationTypes.length) {
        return res.status(404).json({
          success: false,
          message: "No accommodation types found for this rental location"
        });
      }

      const accommodationTypeIds = accommodationTypes.map(type => type._id);
      filter.accommodationTypeId = { $in: accommodationTypeIds };
    }

    // Fetch services based on the filter (either all services or filtered ones)
    const services = await Service.find(filter);

    res.status(200).json({
      success: true,
      data: services.map(doc => doc.toJSON())
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