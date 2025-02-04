const Report = require("../models/reportModel")
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const createReport = asyncHandler(async (req, res) => {
    try {
      const newReport = await Report.create(req.body);
      res.json(newReport);
    } catch (error) {
      throw new Error(error);
    }
  });

  const updateReport = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const updateReport = await Report.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.json(updateReport);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  const deleteReport = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const deleteReport = await Report.findByIdAndDelete(id);
      res.json(deleteReport);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  const getReport = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const get1Report = await Report.findById(id);
      res.json(get1Report);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  const getAllReport = asyncHandler(async (req, res) => {
    try {
      const getAllReport = await Report.find();
      res.json(getAllReport);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  module.exports = {
    createReport,
    updateReport,
    deleteReport,
    getReport,
    getAllReport,
  };