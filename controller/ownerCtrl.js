const Owner = require("../models/ownerModel");
const Role = require("../models/roleModel");
const User = require("../models/userModel");
const { OwnerStatusLog, OWNER_STATUS_LOG } = require("../models/ownerStatusLogModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const softDelete = require("../utils/softDelete");

const createOwner = asyncHandler(async (req, res) => {
    try {
        const ownerData = {
            ...req.body,
            isApproved: false
        };

        const newOwner = await Owner.create(ownerData);

        await OwnerStatusLog.create({
            ownerId: newOwner._id,
            oldStatus: null,
            newStatus: OWNER_STATUS_LOG.APPROVING,
            note: "Owner account created and pending approval"
        });
        res.json(newOwner);
    } catch (error) {
        throw new Error(error);
    }
});

const updateOwner = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        // Find the current owner first to get the original status
        const currentOwner = await Owner.findById(id);
        if (!currentOwner) {
            res.status(404);
            throw new Error('Owner not found');
        }
        const existingLog = await OwnerStatusLog.findOne({ownerId: id});
        const oldStatus = existingLog ? existingLog.newStatus : OWNER_STATUS_LOG.APPROVING;

        let newStatus;
        if (req.body.isApproved === true) {
            newStatus = OWNER_STATUS_LOG.APPROVED;
        } else if (req.body.isApproved === false) {
            newStatus = OWNER_STATUS_LOG.DENIED;
        } else {
            newStatus = oldStatus;
        }

        const updateOwner = await Owner.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        if (req.body.isApproved !== undefined && oldStatus !== newStatus) {
            if (existingLog) {
                existingLog.oldStatus = oldStatus;
                existingLog.newStatus = newStatus;
                existingLog.note = req.body.note || `Status updated to ${newStatus === OWNER_STATUS_LOG.APPROVED ? 'approved' : 'denied'}`;
                await existingLog.save();
            } else {
                await OwnerStatusLog.create({
                    ownerId: id,
                    oldStatus: oldStatus,
                    newStatus: newStatus,
                    note: req.body.note || `Status updated to ${newStatus === OWNER_STATUS_LOG.APPROVED ? 'approved' : 'denied'}`
                });
            }
        }
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
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const get1Owner = await Owner.findOne({_id: id, isDelete: false});
        res.json(get1Owner);
    } catch (error) {
        throw new Error(error);
    }
});

const getOwnerByUserId = asyncHandler(async (req, res) => {
    const {userId} = req.params;
    validateMongoDbId(userId);

    try {
        const owner = await Owner.findOne({userId: userId, isDelete: false})
            .populate({
                path: "userId",
                select: "-password -tokenId -createdAt -updatedAt -isDelete -roleId",
            })
            .populate({
                path: "paymentInformationId",
                model: "PaymentInformation",
                select: "-createdAt -updatedAt -isDelete",
            })
            .populate({
                path: "businessInformationId",
                model: "BusinessInformation",
                select: "-createdAt -updatedAt -isDelete",
            });

        if (!owner) {
            return res
                .status(404)
                .json({message: "Owner not found for this userId"});
        }

        res.json(owner);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

const getAllOwner = async (req, res) => {
    try {
        // Lấy tất cả khách hàng chưa bị xóa
        const owners = await Owner.find({isDelete: false});

        // Duyệt qua từng Owner để kiểm tra sự tồn tại của userId trong bảng User
        for (const owner of owners) {
            const userExists = await User.findById(owner.userId);
            if (!userExists) {
                // Xóa mềm nếu không tìm thấy User tương ứng
                await softDelete(Owner, owner._id);
            }
        }

        // Lấy lại danh sách khách hàng sau khi đã xoá những Owner không có User
        const updatedOwners = await Owner.find({isDelete: false})
            .populate("businessInformationId")
            .populate("paymentInformationId");

        res.json(updatedOwners);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

module.exports = {
    createOwner,
    updateOwner,
    deleteOwner,
    getOwner,
    getOwnerByUserId,
    getAllOwner,
};
