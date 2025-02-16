const Owner = require("../models/ownerModel");
const Role = require("../models/roleModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const createOwner = asyncHandler(async (req, res) => {
  try {
    const newOwner = await Owner.create(req.body);
    res.json(newOwner);
  } catch (error) {
    throw new Error(error);
  }
});

const updateOwner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateOwner = await Owner.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateOwner);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteOwner = asyncHandler(async (req, res) => {
  const {id} = req.params;
    try {
        const deletedOwner = await softDelete(Owner, id);

        if (!deletedOwner) {
            return res.status(404).json({message: "Owner not found"});
        }

        res.json({message: "Owner deleted successfully", data: deletedOwner});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

const getOwner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const get1Owner = await Owner.findOne({_id: id, isDelete: false});
    res.json(get1Owner);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllOwner = async (req, res) => {
  try {
    const owners = await Owner.find({ isDelete: false })
      .populate({
        path: 'userId',
        match: { 
          roleID: "67927ff7a0a58ce4f7e8e83d",
          isDelete: false,
        },
        select: '-password'
      })
      .populate('businessInformationId');
    const validOwners = owners.filter(owner => owner.userId !== null);

    res.status(200).json({
      success: true,
      data: validOwners
    });
    
  } catch (error) {
    console.error('Error in getAllOwner:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error'
    });
  }
};
module.exports = {
  createOwner,
  updateOwner,
  deleteOwner,
  getOwner,
  getAllOwner,
};
