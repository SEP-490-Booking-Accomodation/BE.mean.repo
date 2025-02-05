const Service = require("../models/serviceModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");

const createService= asyncHandler(async(req, res) => {
    try{
        const newService = await Service.create(req.body);
        res.join(newService);
    } catch (error){
        throw new Error(error);
    }
});
const updateService = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const updateService = await Service.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.json(updateService);
    } catch (error) {
      throw new Error(error);
    }
});
  
const deleteService = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const deleteService = await Service.findByIdAndDelete(id);
      res.json(deleteService);
    } catch (error) {
      throw new Error(error);
    }
});
  
const getService= asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const getService = await Accommodation.findById(id);
      res.json(getService);
    } catch (error) {
      throw new Error(error);
    }
});

const getAllService = asyncHandler(async (req, res) => {
    try {
      const getAllService = await Accommodation.find();
      res.json(getAllService);
    } catch (error) {
      throw new Error(error);
    }
});

module.exports = {
    createService,
    updateService,
    deleteService,
    getService,
    getAllService,
};