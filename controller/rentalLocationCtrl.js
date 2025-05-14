const {
    RentalLocation,
    RENTALLOCATION_STATUS,
} = require("../models/rentalLocationModel");
const Accommodation = require("../models/accommodationModel");
const AccommodationType = require("../models/accommodationTypeModel");
const Feedback = require("../models/feedbackModel");
const Booking = require("../models/bookingModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");
const {isValidObjectId} = require("../utils/mongoose-helpers");
const softDelete = require("../utils/softDelete");
const {Owner} = require("../models/ownerModel");
const {
    RentalLocationStatusLog,
    RENTAL_STATUS_LOG,
} = require("../models/rentalLocationStatusLogModel");
const mongoose = require("mongoose");

const createRentalLocation = asyncHandler(async (req, res) => {
    try {
        const rentalLocationData = {
            ...req.body,
        };
        const newRentalLocation = await RentalLocation.create(rentalLocationData);

        await RentalLocationStatusLog.create({
            rentalLocationId: newRentalLocation._id,
            oldStatus: null,
            newStatus: RENTAL_STATUS_LOG.PENDING,
            note: "Rental location created and pending approval",
        });
        res.json(newRentalLocation);
    } catch (error) {
        throw new Error(error);
    }
});

const updateRentalLocation = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);

    try {
        // Get the original rental location to know its old status
        const originalRentalLocation = await RentalLocation.findById(id);

        if (!originalRentalLocation) {
            return res.status(404).json({
                success: false,
                message: "Rental location not found",
            });
        }

        const oldStatus = originalRentalLocation.status;

        // Update the rental location
        const updatedRentalLocation = await RentalLocation.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
            }
        );

        // Only create a log entry if the status has changed
        if (oldStatus !== updatedRentalLocation.status) {
            await RentalLocationStatusLog.create({
                rentalLocationId: updatedRentalLocation._id,
                oldStatus: oldStatus || null,
                newStatus: updatedRentalLocation.status,
                note: req.body.note || " ",
            });
        }

        res.json({
            success: true,
            data: updatedRentalLocation,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const deleteRentalLocation = asyncHandler(async (req, res) => {
    const {id} = req.params;
    try {
        const deletedRentalLocation = await softDelete(RentalLocation, id);

        if (!deletedRentalLocation) {
            return res.status(404).json({message: "RentalLocation not found"});
        }

        res.json({
            message: "RentalLocation deleted successfully",
            data: deletedRentalLocation,
        });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

const getRentalLocation = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);

    try {
        const rentalLocation = await RentalLocation.findOne({
            _id: id,
            isDelete: false,
        })
            .populate({
                path: "ownerId",
                populate: [
                    {
                        path: "userId",
                        match: {
                            roleID: "67f87ca3c19b91da666bbdc7",
                            isDelete: false,
                        },
                        select: "-password -createdAt -updatedAt -__v",
                    },
                    {
                        path: "businessInformationId",
                        select: "-createdAt -updatedAt -__v",
                    },
                ],
                select: "isApproved note",
            })
            .populate({
                path: "landUsesRightId",
                select: "", // Include the fields you want from LandUsesRight model
            });

        if (!rentalLocation) {
            return res
                .status(404)
                .json({success: false, message: "Rental location not found"});
        }

        res.json({success: true, data: rentalLocation});
    } catch (error) {
        throw new Error(error);
    }
});

const getAllAccommodationTypeOfRentalLocation = asyncHandler(
    async (req, res) => {
        const {id} = req.params;
        validateMongoDbId(id);
        try {
            const rentalLocation = await RentalLocation.findOne({
                _id: id,
                isDelete: false,
            }).populate({
                path: "ownerId",
                select: "-createdAt -updatedAt -isDelete",
                populate: {path: "userId", select: "fullName"},
            });

            const formattedRentalLocations = rentalLocation.toJSON();

            console.log(id);
            const accommodationTypeIds = await AccommodationType.find({
                rentalLocationId: id,
                isDelete: false,
            }).populate({
                path: "serviceIds",
                select: "name",
            });

            // Đếm số lượng accommodationTypeIds trước
            const accommodationTypeCount = await AccommodationType.countDocuments({
                rentalLocationId: id,
                isDelete: false,
            });

            formattedRentalLocations.accommodationTypeIds = {
                count: accommodationTypeCount,
                data: accommodationTypeIds,
            };

            res.status(200).json({
                success: true,
                data: formattedRentalLocations,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
);

const getAllRentalLocation = asyncHandler(async (req, res) => {
    try {
        const {ownerId} = req.query;

        const filter = {isDelete: false};
        if (ownerId) {
            if (!isValidObjectId(ownerId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid ownerId format",
                });
            }
            filter.ownerId = ownerId;
        }

        const rentalLocations = await RentalLocation.find(filter)
            .populate({
                path: "ownerId",
                populate: [
                    {
                        path: "userId",
                        match: {
                            roleID: "67f87ca3c19b91da666bbdc7",
                        },
                        select: "fullName email phone avatarUrl",
                    },
                    {
                        path: "businessInformationId",
                        select: "companyName companyAddress taxID",
                    },
                ],
            })
            .populate({
                path: "landUsesRightId",
                select: "", // Include the fields you want from LandUsesRight model
            })
            .populate({
                path: "accommodationTypeIds",
                select: "name ", // Add the fields you need from AccommodationType
            });

        res.status(200).json({
            success: true,
            data: rentalLocations,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
});


const getAllRentalLocationHaveRating = asyncHandler(async (req, res) => {
    try {
        const { ownerId } = req.query;

        if (ownerId && !isValidObjectId(ownerId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ownerId format",
            });
        }

        const filter = { isDelete: false };
        if (ownerId) filter.ownerId = ownerId;

        // Get rental locations with populated data
        const rentalLocations = await RentalLocation.find(filter)
            .populate({
                path: "ownerId",
                populate: [
                    {
                        path: "userId",
                        match: { roleID: "67f87ca3c19b91da666bbdc7" },
                        select: "fullName email phone avatarUrl",
                    },
                    {
                        path: "businessInformationId",
                        select: "companyName companyAddress taxID",
                    },
                ],
            })
            .populate({
                path: "landUsesRightId",
                select: "",
            });

        if (!rentalLocations.length) {
            return res.status(404).json({
                success: false,
                message: "No rental locations found"
            });
        }
        const rentalLocationIds = rentalLocations.map(loc => loc._id);

        const ratings = await Feedback.aggregate([
            { $lookup: {
                    from: "bookings",
                    localField: "bookingId",
                    foreignField: "_id",
                    as: "booking"
                }},
            { $unwind: "$booking" },

            { $lookup: {
                    from: "accommodations",
                    localField: "booking.accommodationId",
                    foreignField: "_id",
                    as: "accommodation"
                }},
            { $unwind: "$accommodation" },

            { $match: {
                    "accommodation.rentalLocationId": { $in: rentalLocationIds },
                    "isDelete": false,
                    "rating": { $exists: true, $gte: 1, $lte: 5 }
                }},

            { $group: {
                    _id: "$accommodation.rentalLocationId",
                    averageRating: { $avg: "$rating" },
                    totalFeedbacks: { $sum: 1 }
                }},

            // Format output
            { $project: {
                    _id: 1,
                    averageRating: { $round: ["$averageRating", 2] },
                    totalFeedbacks: 1
                }}
        ]);

        const accommodationTypeIds = [];
        rentalLocations.forEach(loc => {
            if (loc.accommodationTypeIds && Array.isArray(loc.accommodationTypeIds)) {
                accommodationTypeIds.push(...loc.accommodationTypeIds);
            } else if (loc.accommodationTypeId) {
                accommodationTypeIds.push(loc.accommodationTypeId);
            }
        });

        const accommodationTypes = await AccommodationType.find({
            _id: { $in: accommodationTypeIds }
        });

        const ratingMap = new Map();
        ratings.forEach(item => {
            ratingMap.set(item._id.toString(), {
                averageRating: item.averageRating,
                totalFeedbacks: item.totalFeedbacks
            });
        });

        const rentalToAccTypesMap = new Map();
        rentalLocations.forEach(loc => {
            const rentalId = loc._id.toString();
            const accTypeIds = [];

            if (loc.accommodationTypeIds && Array.isArray(loc.accommodationTypeIds)) {
                accTypeIds.push(...loc.accommodationTypeIds.map(id => id.toString()));
            } else if (loc.accommodationTypeId) {
                accTypeIds.push(loc.accommodationTypeId.toString());
            }

            rentalToAccTypesMap.set(rentalId, accTypeIds);
        });

        const priceMap = new Map();
        accommodationTypes.forEach(accType => {
            const accTypeId = accType._id.toString();
            const price = accType.basePrice || 0;

            rentalToAccTypesMap.forEach((accTypeIds, rentalId) => {
                if (accTypeIds.includes(accTypeId)) {
                    if (!priceMap.has(rentalId)) {
                        priceMap.set(rentalId, { min: price, max: price });
                    } else {
                        const current = priceMap.get(rentalId);
                        current.min = Math.min(current.min, price);
                        current.max = Math.max(current.max, price);
                        priceMap.set(rentalId, current);
                    }
                }
            });
        });

        const rentalData = rentalLocations.map(rental => {
            const rentalId = rental._id.toString();
            const ratingInfo = ratingMap.get(rentalId) || { averageRating: 0, totalFeedbacks: 0 };
            const priceInfo = priceMap.get(rentalId) || { min: 0, max: 0 };

            return {
                ...rental.toObject(),
                averageRating: ratingInfo.averageRating || 0,
                totalFeedbacks: ratingInfo.totalFeedbacks || 0,
                minPrice: priceInfo.min,
                maxPrice: priceInfo.max
            };
        });

        res.status(200).json({
            success: true,
            data: rentalData
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
});


const updateRentalLocationStatus = asyncHandler(async (req, res) => {
    const {id} = req.params;
    const {status} = req.body;

    validateMongoDbId(id);
    if (![1, 2, 3, 4, 5, 6].includes(status)) {
        return res.status(400).json({
            success: false,
            message:
                "Invalid status value. Status must be 1 (Pending), 2 (Inactive), 3 (Active), 4 (Pause), 5 (Deleted), or 6 (Needs_Update)",
        });
    }

    try {
        // Get the original rental location to know its old status
        const originalRentalLocation = await RentalLocation.findById(id);
        if (!originalRentalLocation) {
            return res.status(404).json({
                success: false,
                message: "Rental location not found",
            });
        }
        const oldStatus = originalRentalLocation.status;
        if (oldStatus === status) {
            return res.json({
                success: true,
                data: originalRentalLocation,
                message: "No change in status"
            });
        }
        // Update the rental location
        const updatedLocation = await RentalLocation.findByIdAndUpdate(
            id,
            {status: status},
            {new: true}
        );

        // Create a log entry for this status update
        await RentalLocationStatusLog.create({
            rentalLocationId: updatedLocation._id,
            oldStatus: oldStatus || null,
            newStatus: updatedLocation.status,
            note: req.body.note || " ",
        });

        res.json({
            success: true,
            data: updatedLocation,
        });
    } catch (error) {
        throw new Error(error);
    }
});


module.exports = {
    createRentalLocation,
    updateRentalLocation,
    deleteRentalLocation,
    getRentalLocation,
    getAllRentalLocation,
    updateRentalLocationStatus,
    getAllAccommodationTypeOfRentalLocation,
    getAllRentalLocationHaveRating,
};
