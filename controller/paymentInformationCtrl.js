const PaymentInformation = require("../models/paymentInformationModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");

const createPaymentInformation= asyncHandler(async(req, res) => {
    try{
        const newPaymentInformation = await Service.create(req.body);
        res.join(newPaymentInformation);
    } catch (error){
        throw new Error(error);
    }
});
const updatePaymentInformation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const updatePaymentInformation = await PaymentInformation.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.json(updatePaymentInformation);
    } catch (error) {
      throw new Error(error);
    }
});
  
const deletePaymentInformation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const deletePaymentInformation = await PaymentInformation.findByIdAndDelete(id);
      res.json(deletePaymentInformation);
    } catch (error) {
      throw new Error(error);
    }
});
  
const getPaymentInformation= asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const getPaymentInformation = await Accommodation.findById(id);
      res.json(getPaymentInformation);
    } catch (error) {
      throw new Error(error);
    }
});

const getAllPaymentInformation = asyncHandler(async (req, res) => {
    try {
      const getAllPaymentInformation = await Accommodation.find();
      res.json(getAllPaymentInformation);
    } catch (error) {
      throw new Error(error);
    }
});

module.exports = {
    createPaymentInformation,
    updatePaymentInformation,
    deletePaymentInformation,
    getPaymentInformation,
    getAllPaymentInformation,
};