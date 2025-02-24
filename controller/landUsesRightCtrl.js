const LandUsesRight = require("../models/landUsesRight");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");
const softDelete = require("../utils/softDelete");

const createLandUsesRight= asyncHandler(async(req, res) => {
    try{
        const newLandUsesRight = await LandUsesRight.create(req.body);
        res.json(newLandUsesRight);
    } catch (error){
        throw new Error(error);
    }
});
const updateLandUsesRight = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const updateLandUsesRight = await LandUsesRight.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.json(updateLandUsesRight);
    } catch (error) {
      throw new Error(error);
    }
});
  
const deleteLandUsesRight = asyncHandler(async (req, res) => {
  const {id} = req.params;
  try {
      const deletedLandUsesRight = await softDelete(LandUsesRight, id);

      if (!deletedLandUsesRight) {
          return res.status(404).json({message: "LandUsesRight not found"});
      }

      res.json({message: "LandUsesRight deleted successfully", data: deletedLandUsesRight});
  } catch (error) {
      res.status(500).json({message: error.message});
  }
});
  
const getLandUsesRight= asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const getLandUsesRight = await LandUsesRight.findOne({_id: id, isDelete: false});
      res.json(getLandUsesRight);
    } catch (error) {
      throw new Error(error);
    }
});

const getAllLandUsesRight = asyncHandler(async (req, res) => {
  try {
    const landUsesRights = await LandUsesRight.find({isDelete: false});
    const formattedLandUsesRights = landUsesRights.map(doc => doc.toJSON());
    res.status(200).json({
      success: true,
      data: formattedLandUsesRights
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
});

module.exports = {
    createLandUsesRight,
    updateLandUsesRight,
    deleteLandUsesRight,
    getAllLandUsesRight,
    getLandUsesRight,
};