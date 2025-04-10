const PaymentInformation = require("../models/paymentInformationModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");
const softDelete = require("../utils/softDelete");
const Owner = require("../models/ownerModel");

const createPaymentInformation = asyncHandler(async (req, res) => {
  try {
    const { ownerId, bankNo } = req.body;

    // Kiểm tra owner có tồn tại không
    const owner = await Owner.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    // Kiểm tra trùng bankNo
    const existingBankNo = await PaymentInformation.findOne({
      bankNo,
      isDelete: false,
    });
    if (existingBankNo) {
      return res.status(400).json({ message: "Bank No already exists" });
    }

        const newPaymentInformation = await PaymentInformation.create(req.body);
    // Cập nhật businessInformationId vào owner
    owner.paymentInformationId = newPaymentInformation._id;
    await owner.save();

    res.json(newPaymentInformation);
  } catch (error) {
    throw new Error(error);
  }
});
const updatePaymentInformation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatePaymentInformation = await PaymentInformation.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    );
    res.json(updatePaymentInformation);
  } catch (error) {
    throw new Error(error);
  }
});

const deletePaymentInformation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deletedPaymentInformation = await softDelete(PaymentInformation, id);

    if (!deletedPaymentInformation) {
      return res.status(404).json({ message: "PaymentInformation not found" });
    }

    res.json({
      message: "PaymentInformation deleted successfully",
      data: deletedPaymentInformation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getPaymentInformation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getPaymentInformation = await PaymentInformation.findOne({
      _id: id,
      isDelete: false,
    });
    res.json(getPaymentInformation);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllPaymentInformation = asyncHandler(async (req, res) => {
  try {
    const paymentInformations = await PaymentInformation.find({
      isDelete: false,
    });
    const formattedPaymentInformations = paymentInformations.map((doc) =>
      doc.toJSON()
    );
    res.status(200).json({
      success: true,
      data: formattedPaymentInformations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
});

module.exports = {
  createPaymentInformation,
  updatePaymentInformation,
  deletePaymentInformation,
  getPaymentInformation,
  getAllPaymentInformation,
};
