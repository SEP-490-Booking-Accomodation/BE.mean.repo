const Customer = require("../models/customerModel");
const Role = require("../models/roleModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const softDelete = require("../utils/softDelete");
const Coupon = require("../models/couponModel");

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
  try {
    const deletedCustomer = await softDelete(Customer, id);

    if (!deletedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json({
      message: "Customer deleted successfully",
      data: deletedCustomer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

// const getAllCustomer = asyncHandler(async (req, res) => {
//   try {
//     const getCustomerUsers = await Role.findOne({ roleName: 'Customer' });
//     const getCustomers = await User.find({ roleID: getCustomerUsers._id });

//     // Lưu các Customer vào bảng Owner (nếu chưa có)
//         for (const customer of getCustomers) {
//           const existingCustomer = await Customer.findOne({ userId: customer._id });
//           if (!existingCustomer) {
//             // Thêm Customer vào bảng Customer nếu chưa tồn tại
//             await Customer.create({ userId: customer._id });
//           }
//         }

//     res.json(getCustomers);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

const getCustomerByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  validateMongoDbId(userId);

  try {
    const customer = await Customer.findOne({
      userId: userId,
      isDelete: false,
    }).populate({
      path: "userId",
      select:
        "-password -tokenId -createdAt -updatedAt -isDelete -roleId -isActive -isVerifiedPhone", // Loại bỏ trường nhạy cảm
    });

    if (!customer) {
      return res
        .status(404)
        .json({ message: "Customer not found for this userId" });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getAllCustomer = async (req, res) => {
  try {
    const getAllCustomer = await Customer.find({ isDelete: false });
    res.json(getAllCustomer);
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomer,
  getCustomerByUserId,
  getAllCustomer,
};
