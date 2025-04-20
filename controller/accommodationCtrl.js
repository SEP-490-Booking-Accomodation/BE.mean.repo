const Accommodation = require("../models/accommodationModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");
const softDelete = require("../utils/softDelete");

const createAccommodation = asyncHandler(async (req, res) => {
    try {
        // Check if the request body is an array or a single object
        const accommodationsData = Array.isArray(req.body) ? req.body : [req.body];

        // Check for duplicates within the array itself (roomNo + rentalLocationId combination)
        const roomLocationCombos = new Set();
        for (const acc of accommodationsData) {
            const combo = `${acc.roomNo}-${acc.rentalLocationId}`;
            if (roomLocationCombos.has(combo)) {
                return res.status(400).json({
                    success: false,
                    message: `Duplicate room number ${acc.roomNo} found for the same rental location in request`
                });
            }
            roomLocationCombos.add(combo);
        }

        const duplicateChecks = [];
        for (const acc of accommodationsData) {
            duplicateChecks.push({
                roomNo: acc.roomNo,
                rentalLocationId: acc.rentalLocationId,
                isDelete: false
            });
        }

        const existingRooms = await Accommodation.find({ $or: duplicateChecks });

        if (existingRooms.length > 0) {
            const existingCombos = existingRooms.map(room =>
                `Room ${room.roomNo} at location ${room.rentalLocationId}`
            );
            return res.status(400).json({
                success: false,
                message: `These room and location combinations already exist: ${existingCombos.join(', ')}`
            });
        }

        // If no duplicates, create all accommodations
        const newAccommodations = await Accommodation.create(accommodationsData);

        res.status(201).json({
            success: true,
            data: newAccommodations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
const updateAccommodation = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const updateAccommodation = await Accommodation.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        res.json(updateAccommodation);
    } catch (error) {
        throw new Error(error);
    }
});

const deleteAccommodation = asyncHandler(async (req, res) => {
    const {id} = req.params;
    try {
        const deletedAccommodation = await softDelete(Accommodation, id);

        if (!deletedAccommodation) {
            return res.status(404).json({message: "Accommodation not found"});
        }

        res.json({message: "Accommodation deleted successfully", data: deletedAccommodation});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

const getAccommodation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        // Find accommodation by ID and make sure it's not deleted
        const accommodation = await Accommodation.findOne({ _id: id, isDelete: false })
            .populate({
                path: 'rentalLocationId',
                select: '-__v'
            })
            .populate({
                path: 'accommodationTypeId',
                select: '-__v',
                populate: {
                    path: "serviceIds",
                    select: "-createdAt -updatedAt -isDelete -id -status -accomodationTypeId",
                }
            });

        // If accommodation not found
        if (!accommodation) {
            return res.status(404).json({
                success: false,
                message: "Accommodation not found"
            });
        }

        // Format the accommodation
        const formattedAccommodation = accommodation.toJSON();

        res.status(200).json({
            success: true,
            data: formattedAccommodation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
});

const getAllAccommodation = asyncHandler(async (req, res) => {
    try {
        const { rentalLocationId } = req.query;

        // Create a filter object - start with isDelete: false
        const filter = { isDelete: false };

        // Add rentalLocationId to filter if it exists in the query
        if (rentalLocationId) {
            filter.rentalLocationId = rentalLocationId;
        }

        const accommodations = await Accommodation.find(filter)
            .populate({
                path: 'accommodationTypeId',
                select: '-__v',
                populate: {
                    path: "serviceIds",
                    select: "-createdAt -updatedAt -isDelete -id -status -accomodationTypeId",
                }
            })
            .populate({
                path: 'rentalLocationId',
                select: '-__v'
            });

        console.log(accommodations.map(a => a.accommodationTypeId));
        const formattedAccommodations = accommodations.map(doc => doc.toJSON());

        res.status(200).json({
            success: true,
            data: formattedAccommodations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
});

const getAccommodationsByLocationId = asyncHandler(async (req, res) => {
    try {
        const { rentalLocationId } = req.params; // Get the locationId from the request parameters

        // Find accommodations that match the locationId and aren't deleted
        const accommodations = await Accommodation.find({
            rentalLocationId: rentalLocationId,
            isDelete: false
        })
            .populate({
                path: 'accommodationTypeId',
                select: '-__v',
                populate: {
                    path: "serviceIds",
                    select: "-createdAt -updatedAt -isDelete -id -status -accomodationTypeId",
                }
            })
            .populate({
                path: 'rentalLocationId',
                select: '-__v'
            });

        const formattedAccommodations = accommodations.map(doc => doc.toJSON());

        res.status(200).json({
            success: true,
            data: formattedAccommodations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
});

module.exports = {
    createAccommodation,
    updateAccommodation,
    deleteAccommodation,
    getAccommodation,
    getAccommodationsByLocationId,
    getAllAccommodation,

};