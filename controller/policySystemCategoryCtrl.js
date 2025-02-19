const PolicySystemCategory = require("../models/policySystemCategoryModel")
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const softDelete = require("../utils/softDelete");

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
    const {id} = req.params;
    try {
        const deletedPolicySystemCategory = await softDelete(PolicySystemCategory, id);

        if (!deletedPolicySystemCategory) {
            return res.status(404).json({message: "PolicySystemCategory not found"});
        }

        res.json({message: "PolicySystemCategory deleted successfully", data: deletedPolicySystemCategory});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
  });
  
  const getPolicySystemCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const get1PolicySystemCategory = await PolicySystemCategory.findOne({_id: id, isDelete: false});
      res.json(get1PolicySystemCategory);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  const getAllPolicySystemCategory = asyncHandler(async (req, res) => {
    try {
      const getAllPolicySystemCategory = await PolicySystemCategory.find({isDelete: false});
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