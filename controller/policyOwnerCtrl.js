const PolicyOwner = require("../models/policyOwnerModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");
const Value = require("../models/valueModel");
const softDelete = require("../utils/softDelete");
const {startSession} = require("mongoose");

const createPolicyOwner = asyncHandler(async (req, res) => {
    try {
        const {values, ...policyOwnerData} = req.body;

        const session = await startSession();
        session.startTransaction();

        try {
            const newPolicyOwner = await PolicyOwner.create([policyOwnerData], {
                session,
            });

            let valueIds = [];

            if (Array.isArray(values) && values.length > 0) {
                const valueList = values.map((value) => ({
                    ...value,
                    policyOwnerId: newPolicyOwner[0]._id,
                }));

                const createdValues = await Value.insertMany(valueList, {session});
                valueIds = createdValues.map(value => value._id);

                // Update the PolicyOwner with references to the values
                await PolicyOwner.findByIdAndUpdate(
                    newPolicyOwner[0]._id,
                    {values: valueIds},
                    {session}
                );
            }

            await session.commitTransaction();
            session.endSession();

            // Fetch the complete policy owner with populated values
            const completePolicyOwner = await PolicyOwner.findById(
                newPolicyOwner[0]._id
            ).populate('values');

            res.status(201).json(completePolicyOwner);
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});
const updatePolicyOwner = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);

    try {
        const {values, ...policyOwnerData} = req.body;
        const session = await startSession();
        session.startTransaction();

        try {
            const updatedPolicyOwner = await PolicyOwner.findByIdAndUpdate(
                id,
                policyOwnerData,
                {new: true, session}
            );

            if (Array.isArray(values)) {
                const existingValues = await Value.find({policyOwnerId: id});

                const valuesToUpdate = [];
                const valuesToCreate = [];
                const existingValueIds = new Set();

                values.forEach((value) => {
                    if (value._id) {
                        // If value has ID, it's an update
                        valuesToUpdate.push(value);
                        existingValueIds.add(value._id.toString());
                    } else {

                        valuesToCreate.push({
                            ...value,
                            policyOwnerId: id,
                        });
                    }
                });

                const valuesToDelete = existingValues.filter(
                    (value) => !existingValueIds.has(value._id.toString())
                );

                if (valuesToCreate.length > 0) {
                    await Value.create(valuesToCreate, {session, ordered: true});
                }

                for (const value of valuesToUpdate) {
                    await Value.findByIdAndUpdate(value._id, value, {session});
                }

                // Soft delete instead of hard delete
                for (const value of valuesToDelete) {
                    await Value.findByIdAndUpdate(
                        value._id,
                        {
                            isDelete: true,
                            updateBy: req.user?._id || policyOwnerData.updateBy,
                        },
                        {session}
                    );
                }
            }

            await session.commitTransaction();
            session.endSession();

            if (policyOwnerData.isDelete === true) {
                await softDelete(PolicyOwner, id);
            }

            const completeUpdatedPolicyOwner = await PolicyOwner.findById(id);
            const associatedValues = await Value.find({
                policyOwnerId: id,
                isDelete: {$ne: true},
            });

            res.json({
                ...completeUpdatedPolicyOwner.toObject(),
                values: associatedValues,
            });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const deletePolicyOwner = asyncHandler(async (req, res) => {
    const {id} = req.params;
    try {
        const deletedPolicyOwner = await softDelete(PolicyOwner, id);

        if (!deletedPolicyOwner) {
            return res.status(404).json({message: "PolicyOwner not found"});
        }

        res.json({
            message: "PolicyOwner deleted successfully",
            data: deletedPolicyOwner,
        });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

const getPolicyOwner = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const policyOwner = await PolicyOwner.findOne({
            _id: id,
            isDelete: false,
        }).populate({
            path: "ownerId",
            select: "-createdAt -updatedAt -isDelete",
            populate: {path: "userId", select: "fullName"},
        });

        if (!policyOwner) {
            return res
                .status(404)
                .json({success: false, message: "PolicyOwner not found"});
        }

        const docObj = policyOwner.toJSON();

        const values = await Value.find({
            policyOwnerId: docObj._id,
            isDelete: false,
        }).select();

        docObj.values = values;

        res.status(200).json({
            success: true,
            data: docObj,
        });
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
});

const getPolicyOwnerByOwnerId = asyncHandler(async (req, res) => {
    const {ownerId} = req.params;
    validateMongoDbId(ownerId);
    try {
        const owners = await PolicyOwner.find({
            ownerId,
            isDelete: false,
        }).populate({
            path: "ownerId",
            populate: {path: "userId", select: "fullName"},
        });
        if (owners.length === 0) {
            return res
                .status(404)
                .json({message: "No policy owners found for this owner ID"});
        }
        res.json({
            message: "Owners retrieved successfully",
            owners,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const getAllPolicyOwner = asyncHandler(async (req, res) => {
    try {
        const policyOwners = await PolicyOwner.find({isDelete: false}).populate({
            path: "ownerId",
            select: "-createdAt -updatedAt -isDelete",
            populate: {path: "userId", select: "fullName"},
        });
        const formattedPolicyOwners = await Promise.all(
            policyOwners.map(async (doc) => {
                const docObj = doc.toJSON();

                const values = await Value.find({
                    policyOwnerId: docObj._id,
                    isDelete: false,
                }).select();

                docObj.values = values;

                return docObj;
            })
        );

        res.status(200).json({
            success: true,
            data: formattedPolicyOwners,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
});

module.exports = {
    createPolicyOwner,
    updatePolicyOwner,
    deletePolicyOwner,
    getPolicyOwner,
    getPolicyOwnerByOwnerId,
    getAllPolicyOwner,
};
