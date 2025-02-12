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
    const {id} = req.params;
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
    const {id} = req.params;
    try {
        const deletedCustomer = await softDelete(Customer, id);

        if (!deletedCustomer) {
            return res.status(404).json({message: "Customer not found"});
        }
        res.json({message: "Customer deleted successfully", data: deletedCustomer});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

const getCustomer = asyncHandler(async (req, res) => {
    const {id} = req.params;
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

const getAllCustomer = async (req, res) => {
    try {
        // Lấy danh sách người dùng (User) có roleID phù hợp
        const userList = await User.find({
            roleID: "67927ffda0a58ce4f7e8e840",
        }).select("-password");

        // Kiểm tra nếu không có người dùng nào thỏa mãn điều kiện
        if (!userList.length) {
            return res.status(200).json({
                success: true,
                data: [],
            });
        }

        // Lọc và định dạng dữ liệu từ bảng User
        const formattedCustomer = userList.map(async (user) => {
            // Tạo mới Customer từ User
            const newCustomer = new Customer({
                userId: user._id, // Lưu userId vào bảng Customer
            });

            // Lưu thông tin customer vào bảng Customer
            await newCustomer.save();

            // Trả về thông tin đã định dạng từ bảng User
            return {
                userId: new User(user).toJSON(), // Format dữ liệu của User trước khi trả về
            };
        });

        // Đợi tất cả các bản ghi được lưu vào bảng Customer
        const savedCustomers = await Promise.all(formattedCustomer);

        res.status(200).json({
            success: true,
            data: savedCustomers,
        });
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
};

module.exports = {
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomer,
    getAllCustomer,
};
