const Report = require("../models/reportModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const softDelete = require("../utils/softDelete");

const createReport = asyncHandler(async (req, res) => {
  try {
    const newReport = await Report.create(req.body);
    res.json(newReport);
  } catch (error) {
    throw new Error(error);
  }
});

const updateReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateReport = await Report.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    // title: báo cáo đã được xử lý
    // nội dung: Báo cáo #id cho #bookingId đã được xử lý
    // vui lòng truy cập ứng dụng Mean (in đậm) để xem chi tiết
    // trân trọng
    res.json(updateReport);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deletedReport = await softDelete(Report, id);

    if (!deletedReport) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json({ message: "Report deleted successfully", data: deletedReport });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const get1Report = await Report.findOneAndUpdate(
      { _id: id, isDelete: false },
      { isReviewed: true },
      {
        new: true,
      }
    ).populate({
      path: "replyBy",
      model: "Admin",
      select: "-createdAt -updatedAt -isDelete",
      populate: {
        path: "userId",
        select:
          "-password -tokenId -createdAt -updatedAt -isDelete -roleId -isActive -isVerifiedPhone", // Loại bỏ trường nhạy cảm
      },
    });

    //thêm gửi mail, title: Hệ thống đang xử lý đơn báo cáo của bạn (#Id report)
    //body: Hệ thống chúng tôi đã nhận đơn báo cáo của bạn vào thời gian (createdAt)
    //thông tin báo cáo của bạn bao gồm:
    //bookingId:
    //reason:
    //content:
    //chúng tôi sẽ cố gắng xử lý đơn báo cáo của bạn trong thời gian sớm nhất
    //cảm ơn bạn đã sử dụng dịch vụ của chúng thôi
    //Đội ngũ team Mean

    //gửi noti
    res.json(get1Report);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllReport = asyncHandler(async (req, res) => {
  try {
    const getAllReport = await Report.find({ isDelete: false })
      .populate({
        path: "bookingId",
        model: "Booking",
        select: "-createdAt -updatedAt -isDelete",
        populate: {
          path: "customerId",
          select: "-createdAt -updatedAt -isDelete",
          populate: {
            path: "userId",
            select:
              "fullName", // Loại bỏ trường nhạy cảm
          },
        },
      })
      .populate({
        path: "replyBy",
        model: "Owner",
        select: "-createdAt -updatedAt -isDelete",
        populate: {
          path: "userId",
          select:
            "-password -tokenId -createdAt -updatedAt -isDelete -roleId -isActive -isVerifiedPhone", // Loại bỏ trường nhạy cảm
        },
      });
    res.json(getAllReport);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createReport,
  updateReport,
  deleteReport,
  getReport,
  getAllReport,
};
