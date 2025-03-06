const PolicySystem = require("../models/policySystemModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");
const softDelete = require("../utils/softDelete");


const createPolicySystem = asyncHandler(async (req, res) => {
  try {
    const newPolicySystem = await PolicySystem.create(req.body);
    res.json(newPolicySystem);
  } catch (error) {
    throw new Error(error);
  }
});

// const updatePolicySystem = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   validateMongoDbId(id);
//   try {
//     const updatePolicySystem = await PolicySystem.findByIdAndUpdate(
//       id,
//       req.body,
//       {
//         new: true,
//       }
//     );
//     res.json(updatePolicySystem);
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// const updatePolicySystem = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   validateMongoDbId(id);

//   try {
//     const updateData = {};
//     const currentDateVN = moment().tz("Asia/Ho_Chi_Minh");

//     if (req.body.startDate) {
//       const startDate = moment(req.body.startDate, "DD-MM-YYYY HH:mm:ss").tz(
//         "Asia/Ho_Chi_Minh"
//       );
//       if (!startDate.isAfter(currentDateVN)) {
//         return res
//           .status(400)
//           .json({ message: "Start date must be after the current date." });
//       }
//       updateData.startDate = startDate.toDate();
//     }

//     if (req.body.endDate) {
//       const endDate = moment(req.body.endDate, "DD-MM-YYYY HH:mm:ss").tz(
//         "Asia/Ho_Chi_Minh"
//       );
//       if (updateData.startDate && !endDate.isAfter(updateData.startDate)) {
//         return res
//           .status(400)
//           .json({ message: "End date must be after the start date." });
//       }
//       updateData.endDate = endDate.toDate();
//     }

//     Object.keys(req.body).forEach((key) => {
//       if (!["startDate", "endDate"].includes(key)) {
//         updateData[key] = req.body[key];
//       }
//     });

//     const updatedPolicySystem = await PolicySystem.findByIdAndUpdate(
//       id,
//       { $set: updateData },
//       { new: true }
//     );

//     if (!updatedPolicySystem) {
//       return res.status(404).json({ message: "Policy System not found" });
//     }

//     res.json({
//       message: "Policy System updated successfully",
//       policySystem: updatedPolicySystem,
//     });
//   } catch (error) {
//     throw new Error(error);
//   }
// });

const updatePolicySystem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatePolicySystem = await PolicySystem.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    );
    res.json(updatePolicySystem);
  } catch (error) {
    throw new Error(error);
  }
});

const deletePolicySystem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deletedPolicySystem = await softDelete(PolicySystem, id);

    if (!deletedPolicySystem) {
      return res.status(404).json({ message: "PolicySystem not found" });
    }

    res.json({
      message: "PolicySystem deleted successfully",
      data: deletedPolicySystem,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getPolicySystem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const get1PolicySystem = await PolicySystem.findOne({
      _id: id,
      isDelete: false,
    })
      .populate({
        path: "staffId",
        model: "Staff",
        select: "-createdAt -updatedAt -isDelete",
        populate: {
          path: "userId",
          select:
            "-password -tokenId -createdAt -updatedAt -isDelete -roleId -isActive -isVerifiedPhone", // Loại bỏ trường nhạy cảm
        },
      })
      .populate({
        path: "updateBy",
        model: "Staff",
        select: "-createdAt -updatedAt -isDelete",
        populate: {
          path: "userId",
          select:
            "-password -tokenId -createdAt -updatedAt -isDelete -roleId -isActive -isVerifiedPhone", // Loại bỏ trường nhạy cảm
        },
      })
      .populate({
        path: "policySystemCategoryId",
        model: "PolicySystemCategory",
        select: "-createdAt -updatedAt -isDelete",
      })
      .populate({
        path: "policySystemBookingId",
        model: "PolicySystemBooking",
        select: "-createdAt -updatedAt -isDelete",
      });
    res.json(get1PolicySystem);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllPolicySystem = asyncHandler(async (req, res) => {
  try {
    const getAllPolicySystem = await PolicySystem.find({
      isDelete: false,
    })
      .populate({
        path: "staffId",
        model: "Staff",
        select: "-createdAt -updatedAt -isDelete",
        populate: {
          path: "userId",
          select:
            "-password -tokenId -createdAt -updatedAt -isDelete -roleID -isActive -isVerifiedPhone", // Loại bỏ trường nhạy cảm
        },
      })
      .populate({
        path: "updateBy",
        model: "Staff",
        select: "-createdAt -updatedAt -isDelete",
        populate: {
          path: "userId",
          select:
            "-password -tokenId -createdAt -updatedAt -isDelete -roleID -isActive -isVerifiedPhone", // Loại bỏ trường nhạy cảm
        },
      })
      .populate({
        path: "policySystemCategoryId",
        model: "PolicySystemCategory",
        select: "-createdAt -updatedAt -isDelete",
      })
      .populate({
        path: "policySystemBookingId",
        model: "PolicySystemBooking",
        select: "-createdAt -updatedAt -isDelete",
      });
    res.json(getAllPolicySystem);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createPolicySystem,
  updatePolicySystem,
  deletePolicySystem,
  getPolicySystem,
  getAllPolicySystem,
};
