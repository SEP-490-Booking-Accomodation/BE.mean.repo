const Customer = require("../models/customerModel");
const Role = require("../models/roleModel");
const User = require("../models/userModel")
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const createCustomer = asyncHandler(async (req, res) => {
  try {
    const newCustomer = await Customer.create(req.body);
    res.json(newCustomer);
  } catch (error) {
    throw new Error(error);
  }
});

const updateCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateCustomer = await Customer.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateCustomer);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deleteCustomer = await Customer.findByIdAndDelete(id);
    res.json(deleteCustomer);
  } catch (error) {
    throw new Error(error);
  }
});

const getCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const get1Customer = await Customer.findById(id);
    res.json(get1Customer);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllCustomer = asyncHandler(async (req, res) => {
  try {
    const getCustomerUsers = await Role.findOne({ roleName: 'Customer' });
    const getCustomers = await User.find({ roleID: getCustomerUsers._id });

    // Lưu các Customer vào bảng Owner (nếu chưa có)
        for (const customer of getCustomers) {
          const existingCustomer = await Customer.findOne({ userId: customer._id });
          if (!existingCustomer) {
            // Thêm Customer vào bảng Customer nếu chưa tồn tại
            await Customer.create({ userId: customer._id });
          }
        }

    res.json(getCustomers);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomer,
  getAllCustomer,
};
