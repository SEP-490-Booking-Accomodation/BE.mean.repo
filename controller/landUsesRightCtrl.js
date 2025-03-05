const LandUsesRight = require("../models/landUsesRight");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");
const softDelete = require("../utils/softDelete");

const createLandUsesRight = asyncHandler(async(req, res) => {
  try {
      // Copy request body and remove timestamp fields
      const data = {...req.body};
      delete data.createdAt;
      delete data.updatedAt;
      
      // Parse date fields
      ['uploadDate', 'approvedDate', 'refuseDate'].forEach(field => {
          if (data[field] && typeof data[field] === 'string') {
              const parsedDate = moment.tz(
                  data[field], 
                  "DD/MM/YYYY HH:mm:ss", 
                  "Asia/Ho_Chi_Minh"
              );
              
              if (!parsedDate.isValid()) {
                  throw new Error(`Invalid date format for ${field}: ${data[field]}`);
              }
              
              data[field] = parsedDate.toDate();
          }
      });
      
      // Create and return document
      const newLandUsesRight = await LandUsesRight.create(data);
      res.json(newLandUsesRight);
  } catch (error) {
      res.status(400).json({
          success: false,
          message: error.message || 'Failed to create land uses right document'
      });
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

const getLandUsesRightByRentalLocationId= asyncHandler(async (req, res) =>{
  const { rentalLocationId } = req.params;
    validateMongoDbId(rentalLocationId);
    try {
        const landUsesRight = await LandUsesRight.findOne({ rentalLocationId: rentalLocationId, isDelete: false });
        if (!landUsesRight) {
            return res.status(404).json({ message: "No land uses right found for this rentalLocationId" });
        }
        res.json(landUsesRight);
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
    getLandUsesRightByRentalLocationId
};