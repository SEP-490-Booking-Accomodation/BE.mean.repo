const AccommodationType = require("../models/accommodationTypeModel");
const asyncHandler = require("express-async-handler");
const RentalLocation = require("../models/rentalLocationModel");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");
const softDelete = require("../utils/softDelete");
const Accommodation = require("../models/accommodationModel");
const Service = require("../models/serviceModel");
const mongoose = require('mongoose');

const createAccommodationType = asyncHandler(async (req, res) => {
    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const newAccommodationType = await AccommodationType.create([req.body], { session });

            const accommodationTypeId = newAccommodationType[0]._id;

            const { rentalLocationId } = req.body;

            if (rentalLocationId) {
                await RentalLocation.findByIdAndUpdate(
                    rentalLocationId,
                    { $push: { accommodationTypeIds: accommodationTypeId } },
                    { session }
                );
            }

            // Commit the transaction
            await session.commitTransaction();
            session.endSession();

            res.json(newAccommodationType[0]);
        } catch (error) {
            // If anything fails, abort the transaction
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
const updateAccommodationType = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const updateAccommodationType = await AccommodationType.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
            }
        );
        res.json(updateAccommodationType);
    } catch (error) {
        throw new Error(error);
    }
});

const deleteAccommodationType = asyncHandler(async (req, res) => {
    const {id} = req.params;

    try {
        const deletedAccommodationType = await softDelete(AccommodationType, id);

        if (!deletedAccommodationType) {
            return res.status(404).json({message: "AccommodationType not found"});
        }

        res.json({
            message: "AccommodationType deleted successfully",
            data: deletedAccommodationType,
        });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

const getAccommodationType = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const accommodationType = await AccommodationType.findOne({
            _id: id,
            isDelete: false,
        }).populate("rentalLocationId", "_id name");

        if (!accommodationType) {
            return res.status(404).json({
                success: false,
                message: "Accommodation type not found",
            });
        }
        const formattedAccommodationType = accommodationType.toJSON();

        const serviceIds = await Service.find({
            _id: {$in: accommodationType.serviceIds},
            isDelete: false,
        }).select("_id name description status");

        formattedAccommodationType.serviceIds = serviceIds;

        res.status(200).json({
            success: true,
            data: formattedAccommodationType,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
});

const getAllAccommodationType = asyncHandler(async (req, res) => {
    try {

        const {rentalLocationId} = req.query;

        const query = {isDelete: false};

        if (rentalLocationId) {
            query.rentalLocationId = rentalLocationId;
        }

        // Get accommodation types with the applied filter
        const accommodationTypes = await AccommodationType.find(query)
            .populate("rentalLocationId", "_id name");

        // Get formatted accommodation types with services
        const formattedAccommodationTypes = await Promise.all(
            accommodationTypes.map(async (doc) => {
                const docObj = doc.toJSON();

                // Find all services based on the IDs in serviceIds array
                const serviceIds = await Service.find({
                    _id: {$in: doc.serviceIds}, // Use existing serviceIds array
                    isDelete: false,
                }).select("_id name description status");

                // Add services to the accommodation type object
                docObj.serviceIds = serviceIds;

                return docObj;
            })
        );

        res.status(200).json({
            success: true,
            data: formattedAccommodationTypes,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
});

const getAccommodationTypeByOwnerId = asyncHandler(async (req, res) => {
    try {
        const {ownerId} = req.query;

        if (!ownerId) {
            return res.status(400).json({
                success: false,
                message: "ownerId is required"
            });
        }

        // First, find all rentalLocations that belong to this owner
        const rentalLocations = await RentalLocation.find({
            ownerId: ownerId,
            isDelete: false
        }).select("_id");

        // Extract the rentalLocation IDs
        const rentalLocationIds = rentalLocations.map(location => location._id);

        // Now find all accommodation types that reference these rental locations
        const accommodationTypes = await AccommodationType.find({
            rentalLocationId: {$in: rentalLocationIds},
            isDelete: false
        }).populate("rentalLocationId", "_id name");

        // Get formatted accommodation types with services
        const formattedAccommodationTypes = await Promise.all(
            accommodationTypes.map(async (doc) => {
                const docObj = doc.toJSON();

                // Find all services that reference this accommodation type
                const serviceIds = await Service.find({
                    accommodationTypeId: doc._id,
                    isDelete: false,
                }).select("_id name description status");

                // Add services to the accommodation type object
                docObj.serviceIds = serviceIds;

                return docObj;
            })
        );

        res.status(200).json({
            success: true,
            data: formattedAccommodationTypes,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
});

module.exports = {
    createAccommodationType,
    updateAccommodationType,
    deleteAccommodationType,
    getAccommodationType,
    getAllAccommodationType,
    getAccommodationTypeByOwnerId
};
