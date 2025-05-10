const AccommodationType = require("../models/accommodationTypeModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const softDelete = require("../utils/softDelete");
const Service = require("../models/serviceModel");


const createAccommodationType = asyncHandler(async (req, res) => {
    try {
        const { name, ownerId } = req.body;

        const existingAccommodationType = await AccommodationType.findOne({
            name: name,
            ownerId: ownerId,
            isDelete: false
        });

        if (existingAccommodationType) {
            return res.status(400).json({
                success: false,
                message: `Accommodation type with name '${name}' already exists for this owner`
            });
        }
        const newAccommodationType = await AccommodationType.create(req.body);

        res.status(201).json({
            success: true,
            data: newAccommodationType
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
});
const updateAccommodationType = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const { name } = req.body;
        const currentAccommodationType = await AccommodationType.findById(id);
        if (!currentAccommodationType) {
            return res.status(404).json({
                success: false,
                message: "Accommodation type not found"
            });
        }
        if (name && name !== currentAccommodationType.name) {
            const existingAccommodationType = await AccommodationType.findOne({
                name: name,
                ownerId: currentAccommodationType.ownerId,
                _id: { $ne: id },
                isDelete: false
            });

            if (existingAccommodationType) {
                return res.status(400).json({
                    success: false,
                    message: `Accommodation type with name '${name}' already exists for this owner`
                });
            }
        }
        const updatedAccommodationType = await AccommodationType.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
            }
        );
        res.status(200).json({
            success: true,
            data: updatedAccommodationType
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
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
        }).populate({
            path: "ownerId",
            select: "_id name"
        });

        if (!accommodationType) {
            return res.status(404).json({
                success: false,
                message: "Accommodation type not found",
            });
        }

        const formattedAccommodationType = accommodationType.toJSON();

        if (accommodationType.serviceIds && accommodationType.serviceIds.length > 0) {
            const services = await Service.find({
                _id: { $in: accommodationType.serviceIds },
                isDelete: false,
            }).select("_id name description status");

            formattedAccommodationType.serviceIds = services;
        }

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
        const { ownerId } = req.query;
        const query = { isDelete: false };
        if (ownerId) {
            query.ownerId = ownerId;
        }
        const accommodationTypes = await AccommodationType.find(query)
            .populate({
                path: "ownerId",
                select: "_id name"
            });
        const formattedAccommodationTypes = await Promise.all(
            accommodationTypes.map(async (doc) => {
                const docObj = doc.toJSON();
                if (doc.serviceIds && doc.serviceIds.length > 0) {
                    const services = await Service.find({
                        _id: { $in: doc.serviceIds },
                        isDelete: false,
                    }).select("_id name description status");
                    docObj.serviceIds = services;
                }
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
        const accommodationTypes = await AccommodationType.find({
            ownerId: ownerId,
            isDelete: false
        }).populate({
            path: "serviceIds",
            match: { isDelete: false },
            select: "_id name description status"
        }).populate({
            path: "ownerId",
            select: "_id name"
        });
        const formattedAccommodationTypes = accommodationTypes.map(doc => doc.toJSON());

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
