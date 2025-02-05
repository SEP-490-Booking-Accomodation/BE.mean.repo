const AccommodationType = require("../models/accommodationTypeModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");

const createAccommodationType= asyncHandler(async(req, res) => {
    try{
        const newAccommodationType= await AccommodationType.create(req.body);
        res.join(newAccommodationType);
    } catch (error){
        throw new Error(error);
    }
});
const updateAccommodationType = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const updateAccommodationType = await AccommodationType.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.json(updateAccommodationType);
    } catch (error) {
      throw new Error(error);
    }
});
  
const deleteAccommodationType = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const deleteAccommodationType = await AccommodationType.findByIdAndDelete(id);
      res.json(deleteAccommodationType);
    } catch (error) {
      throw new Error(error);
    }
});
  
const getAccommodationType = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const getAccommodationType = await AccommodationType.findById(id);
      res.json(getAccommodationType);
    } catch (error) {
      throw new Error(error);
    }
});

const getAllAccommodationType = asyncHandler(async (req, res) => {
    try {
      const getAllAccommodationType = await AccommodationType.find();
      res.json(getAllAccommodationType);
    } catch (error) {
      throw new Error(error);
    }
});

module.exports = {
    createAccommodationType,
    updateAccommodationType,
    deleteAccommodationType,
    getAccommodationType,
    getAllAccommodationType,
};