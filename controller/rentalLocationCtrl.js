const RentalLocation = require("../models/rentalLocationModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");

const createRentalLocation= asyncHandler(async(req, res) => {
    try{
        const newRentalLocation= await RentalLocation.create(req.body);
        res.json(newRentalLocation);
    } catch (error){
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
    validateMongoDbId(id);
    try {
      const deleteRentalLocation = await RentalLocation.findByIdAndDelete(id);
      res.json(deleteRentalLocation);
    } catch (error) {
      throw new Error(error);
    }
});
  
const getRentalLocation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const getRentalLocation = await RentalLocation.findById(id);
      res.json(getRentalLocation);
    } catch (error) {
      throw new Error(error);
    }
});

const getAllRentalLocation = asyncHandler(async (req, res) => {
  try {
    const rentalLocations = await RentalLocation.find();
    const formattedRentalLocations = rentalLocations.map(doc => doc.toJSON());
    res.status(200).json({
      success: true,
      data: formattedRentalLocations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
});

module.exports = {
    createRentalLocation,
    updateRentalLocation,
    deleteRentalLocation,
    getRentalLocation,
    getAllRentalLocation,
};