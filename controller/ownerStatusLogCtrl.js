const { OwnerStatusLog, OWNER_STATUS_LOG } = require("../models/ownerStatusLogModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const softDelete = require("../utils/softDelete");

const getOwnerStatusLogByOwnerId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const statusLog = await OwnerStatusLog.findOne({ ownerId: id });

        if (!statusLog) {
            res.status(404);
            throw new Error('Owner status log not found');
        }

        res.json(statusLog);
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = { getOwnerStatusLogByOwnerId };