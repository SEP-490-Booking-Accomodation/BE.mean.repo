const PolicyOwner = require("../models/policyOwnerModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");
const Value = require("../models/valueModel");
const softDelete = require("../utils/softDelete");

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
  const {id} = req.params;
  try {
      const deletedPolicyOwner = await softDelete(PolicyOwner, id);

      if (!deletedPolicyOwner) {
          return res.status(404).json({message: "PolicyOwner not found"});
      }

      res.json({message: "PolicyOwner deleted successfully", data: deletedPolicyOwner});
  } catch (error) {
      res.status(500).json({message: error.message});
  }
});
  
const getPolicyOwner = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const getPolicyOwner = await PolicyOwner.findOne({_id: id, isDelete: false});
      res.json(getPolicyOwner);
    } catch (error) {
      throw new Error(error);
    }
});

const getAllPolicyOwner = asyncHandler(async (req, res) => {
  try {
    const policyOwners = await PolicyOwner.find({ isDelete: false }).populate(
      {
        path: "ownerId",
        select: "-createdAt -updatedAt -isDelete",
        populate: {path: "userId", select:"fullName"}
      });
    const formattedPolicyOwners = await Promise.all(policyOwners.map(
      async (doc) => {
        const docObj = doc.toJSON();

        const values = await Value.find({
          policyOwnerId: docObj._id,
          isDelete: false,
        }).select();

        docObj.values = values;

        return docObj;
      }
    ));

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