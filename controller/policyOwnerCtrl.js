const PolicyOwner = require("../models/policyOwnerModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");

const createPolicyOwner= asyncHandler(async(req, res) => {
    try{
        const newPolicyOwner= await PolicyOwner.create(req.body);
        res.join(newPolicyOwner);
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
      const getAllPolicyOwner = await PolicyOwner.find();
      res.json(getAllPolicyOwner);
    } catch (error) {
      throw new Error(error);
    }
});

module.exports = {
    createPolicyOwner,
    updatePolicyOwner,
    deletePolicyOwner,
    getPolicyOwner,
    getAllPolicyOwner,
};