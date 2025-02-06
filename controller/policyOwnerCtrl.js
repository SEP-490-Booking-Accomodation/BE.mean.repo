const PolicyOwner = require("../models/policyOwnerModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");

const createPolicyOwner= asyncHandler(async(req, res) => {
    try{
        const newPolicyOwner= await PolicyOwner.create(req.body);
        res.json(newPolicyOwner);
    } catch (error){
        throw new Error(error);
    }
});
const updatePolicyOwner = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const updatePolicyOwner = await PolicyOwner.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.json(updatePolicyOwner);
    } catch (error) {
      throw new Error(error);
    }
});
  
const deletePolicyOwner = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const deletePolicyOwner = await PolicyOwner.findByIdAndDelete(id);
      res.json(deletePolicyOwner);
    } catch (error) {
      throw new Error(error);
    }
});
  
const getPolicyOwner = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const getPolicyOwner = await PolicyOwner.findById(id);
      res.json(getPolicyOwner);
    } catch (error) {
      throw new Error(error);
    }
});

const getAllPolicyOwner = asyncHandler(async (req, res) => {
  try {
    const policyOwners = await PolicyOwner.find();
    const formattedPolicyOwners = policyOwners.map(doc => doc.toJSON());
    res.status(200).json({
      success: true,
      data: formattedPolicyOwners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
});

module.exports = {
    createPolicyOwner,
    updatePolicyOwner,
    deletePolicyOwner,
    getPolicyOwner,
    getAllPolicyOwner,
};