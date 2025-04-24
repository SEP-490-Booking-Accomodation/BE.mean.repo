const {
    RentalLocationStatusLog,
    RENTAL_STATUS_LOG,
} = require("../models/rentalLocationStatusLogModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const softDelete = require("../utils/softDelete");



const getRentalLocationStatusLogById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const statusLogs = await RentalLocationStatusLog.find({ rentalLocationId: id }).sort({
            createdAt: -1,
        });

        if (!statusLogs || statusLogs.length === 0) {
            res.status(404);
            throw new Error("Rental location status logs not found");
        }

        res.json(statusLogs);
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = { getRentalLocationStatusLogById };