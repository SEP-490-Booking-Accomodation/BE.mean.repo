const BusinessInformation = require("../models/businessInformationModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");

const createBusinessInformation= asyncHandler(async(req, res) => {
    try{
        const newBusinessInformation= await BusinessInformation.create(req.body);
        res.join(newBusinessInformation);
    } catch (error){
        throw new Error(error);
    }
});
const updateBusinessInformation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const updateBusinessInformation = await BusinessInformation.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.json(updateBusinessInformation);
    } catch (error) {
      throw new Error(error);
    }
});
  
const deleteBusinessInformation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const deleteBusinessInformation = await BusinessInformation.findByIdAndDelete(id);
      res.json(deleteBusinessInformation);
    } catch (error) {
      throw new Error(error);
    }
});
  
const getBusinessInformation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const getBusinessInformation = await BusinessInformation.findById(id);
      res.json(getBusinessInformation);
    } catch (error) {
      throw new Error(error);
    }
});

const getAllBusinessInformation = asyncHandler(async (req, res) => {
    try {
      const getAllBusinessInformation = await BusinessInformation.find();
      res.json(getAllBusinessInformation);
    } catch (error) {
      throw new Error(error);
    }
});

module.exports = {
    createBusinessInformation,
    updateBusinessInformation,
    deleteBusinessInformation,
    getBusinessInformation,
    getAllBusinessInformation,
};