const {
  OwnerStatusLog,
  OWNER_STATUS_LOG,
} = require("../models/ownerStatusLogModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const softDelete = require("../utils/softDelete");

const getOwnerStatusLogByOwnerId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const statusLogs = await OwnerStatusLog.find({ ownerId: id }).sort({
      createdAt: -1,
    });

    if (!statusLogs || statusLogs.length === 0) {
      res.status(404);
      throw new Error("Owner status logs not found");
    }

    res.json(statusLogs);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = { getOwnerStatusLogByOwnerId };
