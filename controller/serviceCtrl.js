const Service = require("../models/serviceModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");
const softDelete = require("../utils/softDelete");

const createService= asyncHandler(async(req, res) => {
    try{
        const newService = await Service.create(req.body);
        res.json(newService);
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
  const {id} = req.params;
  try {
      const deletedService = await softDelete(Service, id);

      if (!deletedService) {
          return res.status(404).json({message: "Service not found"});
      }

      res.json({message: "Service deleted successfully", data: deletedService});
  } catch (error) {
      res.status(500).json({message: error.message});
  }
});
  
const getService= asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const getService = await Service.findOne({_id: id, isDelete: false});
      res.json(getService);
    } catch (error) {
      throw new Error(error);
    }
});

const getAllService = asyncHandler(async (req, res) => {
  try {
    const services = await Service.find({isDelete: false});
    const formattedServices = services.map(doc => doc.toJSON());
    res.status(200).json({
      success: true,
      data: formattedServices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
});

module.exports = {
    createService,
    updateService,
    deleteService,
    getService,
    getAllService,
};