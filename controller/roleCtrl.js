const Role = require("../models/roleModel")
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const createRole = asyncHandler(async (req, res) => {
    try {
      const newRole = await Role.create(req.body);
      res.json(newRole);
    } catch (error) {
      throw new Error(error);
    }
  });

  const updateRole = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const updateRole = await Role.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.json(updateRole);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  const deleteRole = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const deleteRole = await Role.findByIdAndDelete(id);
      res.json(deleteRole);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  const getRole = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const get1Role = await Role.findById(id);
      res.json(get1Role);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  const getAllRole = asyncHandler(async (req, res) => {
    try {
      const getAllRole = await Role.find();
      res.json(getAllRole);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  module.exports = {
    createRole,
    updateRole,
    deleteRole,
    getRole,
    getAllRole,
  };