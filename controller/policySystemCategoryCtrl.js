const PolicySystemCategory = require("../models/policySystemCategoryModel")
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const createPolicySystemCategory = asyncHandler(async (req, res) => {
    try {
      const newPolicySystemCategory = await PolicySystemCategory.create(req.body);
      res.json(newPolicySystemCategory);
    } catch (error) {
      throw new Error(error);
    }
  });

  const updatePolicySystemCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const updatePolicySystemCategory = await PolicySystemCategory.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.json(updatePolicySystemCategory);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  const deletePolicySystemCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const deletePolicySystemCategory = await PolicySystemCategory.findByIdAndDelete(id);
      res.json(deletePolicySystemCategory);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  const getPolicySystemCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const get1PolicySystemCategory = await PolicySystemCategory.findById(id);
      res.json(get1PolicySystemCategory);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  const getAllPolicySystemCategory = asyncHandler(async (req, res) => {
    try {
      const getAllPolicySystemCategory = await PolicySystemCategory.find();
      res.json(getAllPolicySystemCategory);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  module.exports = {
    createPolicySystemCategory,
    updatePolicySystemCategory,
    deletePolicySystemCategory,
    getPolicySystemCategory,
    getAllPolicySystemCategory,
  };