const PolicySystem = require("../models/policySystemModel");
const Value = require("../models/valueModel");
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
      });

    // Nếu không tìm thấy policy system, trả về lỗi 404
    if (!get1PolicySystem) {
      return res
        .status(404)
        .json({ success: false, message: "PolicySystem not found" });
    }

    // Chuyển đổi sang object để thêm giá trị mới
    const formattedPolicySystem = get1PolicySystem.toObject();

    // Lấy danh sách Values liên quan
    const values = await Value.find({
      policySystemId: get1PolicySystem._id, // Sửa policySystemId thành policyBookingId
      isDelete: false,
    });

    formattedPolicySystem.values = values;

    res.status(200).json({
      success: true,
      data: formattedPolicySystem,
    });

    // const formattedPolicySystem = await Promise.all(
    //   get1PolicySystem.map(async (doc) => {
    //     const docObj = doc.toJSON();

    //     const values = await Value.find({
    //       policySystemId: doc._id,
    //       isDelete: false,
    //     });

    //     docObj.values = values;

    //     return docObj;
    //   })
    // );

    // res.status(200).json({
    //   success: true,
    //   data: formattedPolicySystem,
    // });
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
      });
    
    const formattedPolicySystems = await Promise.all(
      getAllPolicySystem.map(async (doc) => {
        const docObj = doc.toJSON();

        const values = await Value.find({
          policySystemId: doc._id,
          isDelete: false,
        });

        docObj.values = values;

        return docObj;
      })
    );
    
    res.status(200).json({
      success: true,
      data: formattedPolicySystems,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getPolicySystemByHashtag = async (req, res) => {
  try {
    const { hashTag } = req.params;

    if (!hashTag) {
      return res.status(400).json({ message: "hashTag is required" });
    }

    // Tìm tất cả các Value có hashTag
    const values = await Value.find({ hashTag }).select("policySystemId");

    console.log(values);

    if (!values.length) {
      return res
        .status(404)
        .json({ message: "No matching PolicySystem found" });
    }

    const policySystemIds = values.map((value) => value.policySystemId);

    console.log(policySystemIds);

    // Tìm các PolicySystem tương ứng với policySystemIds
    const policies = await PolicySystem.find({
      _id: { $in: policySystemIds },
    });

    const formattedPolicySystems = await Promise.all(
      policies.map(async (doc) => {
        const docObj = doc.toJSON();

        const values = await Value.find({
          policySystemId: doc._id,
          isDelete: false,
        });

        docObj.values = values;

        return docObj;
      })
    );

    res.status(200).json({ success: true, data: formattedPolicySystems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  createPolicySystem,
  updatePolicySystem,
  deletePolicySystem,
  getPolicySystem,
  getAllPolicySystem,
  getPolicySystemByHashtag,
};
