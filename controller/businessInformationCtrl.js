const BusinessInformation = require("../models/businessInformationModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");
const softDelete = require("../utils/softDelete");
const { isValidObjectId } = require("../utils/mongoose-helpers");
const Owner = require("../models/ownerModel");

const createBusinessInformation = asyncHandler(async (req, res) => {
  try {
    const { ownerId, taxID } = req.body;

    // Kiểm tra owner có tồn tại không
    const owner = await Owner.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    // Kiểm tra trùng taxId
    const existingTax = await BusinessInformation.findOne({
      taxID,
      isDelete: false,
    });
    if (existingTax) {
      return res.status(400).json({ message: "Tax ID already exists" });
    }

    const newBusinessInformation = await BusinessInformation.create(req.body);

    // Cập nhật businessInformationId vào owner
    owner.businessInformationId = newBusinessInformation._id;
    await owner.save();

    res.json(newBusinessInformation);
  } catch (error) {
    throw new Error(error);
  }
});
const updateBusinessInformation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateBusinessInformation =
      await BusinessInformation.findByIdAndUpdate(id, req.body, {
        new: true,
      });
    res.json(updateBusinessInformation);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteBusinessInformation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBusinessInformation = await softDelete(
      BusinessInformation,
      id
    );

    if (!deletedBusinessInformation) {
      return res.status(404).json({ message: "BusinessInformation not found" });
    }

    res.json({
      message: "BusinessInformation deleted successfully",
      data: deletedBusinessInformation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getBusinessInformation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getBusinessInformation = await BusinessInformation.findOne({
      _id: id,
      isDelete: false,
    });
    res.json(getBusinessInformation);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllBusinessInformation = asyncHandler(async (req, res) => {
  try {
    const businessInformations = await BusinessInformation.find({
      isDelete: false,
    });
    const formattedBusinessInformations = businessInformations.map((doc) =>
      doc.toJSON()
    );
    res.status(200).json({
      success: true,
      data: formattedBusinessInformations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
});

module.exports = {
  createBusinessInformation,
  updateBusinessInformation,
  deleteBusinessInformation,
  getBusinessInformation,
  getAllBusinessInformation,
};
