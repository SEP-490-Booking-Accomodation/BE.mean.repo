const PolicySystemBooking = require("../models/policySystemBookingModel")
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const createPolicySystemBooking = asyncHandler(async (req, res) => {
    try {
      const newPolicySystemBooking = await PolicySystemBooking.create(req.body);
      res.json(newPolicySystemBooking);
    } catch (error) {
      throw new Error(error);
    }
  });

  const updatePolicySystemBooking = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const updatePolicySystemBooking = await PolicySystemBooking.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.json(updatePolicySystemBooking);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  const deletePolicySystemBooking = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const deletePolicySystemBooking = await PolicySystemBooking.findByIdAndDelete(id);
      res.json(deletePolicySystemBooking);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  const getPolicySystemBooking = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const get1PolicySystemBooking = await PolicySystemBooking.findById(id);
      res.json(get1PolicySystemBooking);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  const getAllPolicySystemBooking = asyncHandler(async (req, res) => {
    try {
      const getAllPolicySystemBooking = await PolicySystemBooking.find();
      res.json(getAllPolicySystemBooking);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  module.exports = {
    createPolicySystemBooking,
    updatePolicySystemBooking,
    deletePolicySystemBooking,
    getPolicySystemBooking,
    getAllPolicySystemBooking,
  };