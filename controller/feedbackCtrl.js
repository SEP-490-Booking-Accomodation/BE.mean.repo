const Feedback = require("../models/feedbackModel")
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

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
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const deleteFeedback = await Feedback.findByIdAndDelete(id);
      res.json(deleteFeedback);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  const getFeedback = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const get1Feedback = await Feedback.findById(id);
      res.json(get1Feedback);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  const getAllFeedback = asyncHandler(async (req, res) => {
    try {
      const getAllFeedback = await Feedback.find();
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