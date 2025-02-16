const Feedback = require("../models/feedbackModel")
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const softDelete = require("../utils/softDelete");
const Coupon = require("../models/couponModel");

const createFeedback = asyncHandler(async (req, res) => {
    try {
      const newFeedback = await Feedback.create(req.body);
      res.json(newFeedback);
    } catch (error) {
      throw new Error(error);
    }
  });

  const updateFeedback = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const updateFeedback = await Feedback.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.json(updateFeedback);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  const deleteFeedback = asyncHandler(async (req, res) => {
    const {id} = req.params;
    try {
      const deletedFeedback = await softDelete(Feedback, id);
      if (!deletedFeedback) {
        return res.status(404).json({message: "Feedback not found"});
      }
      res.json({message: "Feedback deleted successfully", data: deletedFeedback});
    } catch (error) {
      res.status(500).json({message: error.message});
    }
  });
  
  const getFeedback = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const get1Feedback = await Feedback.findOne({_id: id, isDelete: false});
      res.json(get1Feedback);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  const getAllFeedback = asyncHandler(async (req, res) => {
    try {
      const getAllFeedback = await Feedback.find({isDelete: false});
      res.json(getAllFeedback);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  module.exports = {
    createFeedback,
    updateFeedback,
    deleteFeedback,
    getFeedback,
    getAllFeedback,
  };