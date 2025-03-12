const Accommodation = require("../models/accommodationModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");
const softDelete = require("../utils/softDelete");

const createAccommodation = asyncHandler(async (req, res) => {
    try {
        const newAccommodation = await Accommodation.create(req.body);
        res.json(newAccommodation);
    } catch (error) {
        throw new Error(error);
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
    try {
        const { rentalLocationId } = req.query;

        const filter = { isDelete: false };
        if (rentalLocationId) {
            if (!isValidObjectId(rentalLocationId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid rentalLocationId format"
                });
            }
            filter.rentalLocationId = rentalLocationId;
        }

        const accommodations = await Accommodation.find(filter)
            .populate({
                path: 'rentalLocationId',
                select: '-__v'
            })
            .populate({
                path: 'accommodationTypeId',
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

const getAllAccommodation = asyncHandler(async (req, res) => {
    try {
        const accommodations = await Accommodation.find({ isDelete: false })
            .populate({
                path: 'accommodationTypeId',
                select: '-__v' // Exclude the '__v' field, modify as needed
            })
            .populate({
                path: 'rentalLocationId',
                select: '-__v' // Exclude the '__v' field, modify as needed
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

module.exports = {
    createAccommodation,
    updateAccommodation,
    deleteAccommodation,
    getAccommodation,
    getAllAccommodation,
};