const Transaction = require("../models/transactionModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");

const createTransaction= asyncHandler(async(req, res) => {
    try{
        const newTransaction = await Transaction.create(req.body);
        res.json(newTransaction);
    } catch (error){
        throw new Error(error);
    }
});
const updateTransaction = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const updateTransaction = await Transaction.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.json(updateTransaction);
    } catch (error) {
      throw new Error(error);
    }
});
  
const deleteTransaction = asyncHandler(async (req, res) => {
  const {id} = req.params;
  try {
      const deletedTransaction = await softDelete(Transaction, id);

      if (!deletedTransaction) {
          return res.status(404).json({message: "Transaction not found"});
      }

      res.json({message: "Transaction deleted successfully", data: deletedTransaction});
  } catch (error) {
      res.status(500).json({message: error.message});
  }
});
  
const getTransaction= asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const getTransaction = await Transaction.findOne({_id: id, isDelete: false});
      res.json(getTransaction);
    } catch (error) {
      throw new Error(error);
    }
});

const getAllTransaction = asyncHandler(async (req, res) => {
  try {
    const transactions = await Transaction.find({isDelete: false});
    const formattedTransactions = transactions.map(doc => doc.toJSON());
    res.status(200).json({
      success: true,
      data: formattedTransactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
});

module.exports = {
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransaction,
    getAllTransaction,
};