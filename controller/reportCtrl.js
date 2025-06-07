const Report = require("../models/reportModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const softDelete = require("../utils/softDelete");
const Notification = require("../models/notificationModel");
const { sendEmail } = require("../controller/emailCrtl");
const moment = require("moment-timezone");

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
    const updatedReport = await Report.findByIdAndUpdate(id, req.body, {
      new: true,
    })
      .populate({
        path: "replyBy",
        model: "Admin",
        populate: {
          path: "userId",
          select: "fullName email", // lấy fullName cho notification
        },
      })
      .populate({
        path: "bookingId",
        populate: {
          path: "customerId",
          populate: {
            path: "userId",
            select: "email fullName",
          },
        },
      });

    if (!updatedReport) {
      return res.status(404).json({ message: "Report not found" });
    }

    const user = updatedReport?.bookingId?.customerId?.userId;
    const email = user?.email;
    const admin = updatedReport?.replyBy?.userId;

    // Gửi email
    if (email) {
      const emailData = {
        to: email,
        subject: `Báo cáo đã được xử lý (#${updatedReport._id})`,
        html: `
          <p>Báo cáo <strong>#${updatedReport._id}</strong> cho booking <strong>#${updatedReport.bookingId?._id}</strong> đã được xử lý.</p>
          <p>Vui lòng truy cập <strong>ứng dụng Mean</strong> để xem chi tiết.</p>
          <p>Cảm ơn bạn đã gửi báo cáo cho chúng tôi. Trường hợp bạn cần thêm hỗ trợ, vui lòng phản hồi lại email này để chúng tôi có thể hỗ trợ bạn nhanh chóng hơn.</p>
        `,
      };

      await sendEmail(emailData);
      console.log(`✅ Email sent to ${email} for report #${updatedReport._id}`);
    } else {
      console.log(`⚠️ No email found for report #${updatedReport._id}`);
    }

    // Gửi notification
    if (user?._id) {
      const notificationContent = `
Đây là kết quả sau khi chúng tôi xử lý đơn báo cáo của bạn:

- reportId: ${updatedReport._id}
- bookingId: ${updatedReport.bookingId?._id}
- Lý do: ${updatedReport.reason}
- Nội dung: ${updatedReport.content}
- Phản hồi: ${updatedReport.contentReply}
- Được hỗ trợ bởi: ${admin?.fullName}

Cảm ơn bạn đã báo cáo cho chúng tôi. Trong trường hợp cần hỗ trợ thêm, vui lòng phản hồi lại thông qua email.
Xin cảm ơn.
`.trim();

      await Notification.create({
        userId: user._id,
        bookingId: updatedReport.bookingId?._id,
        title: `Hệ thống đã xử lý đơn báo cáo của bạn #${updatedReport._id}`,
        content: notificationContent,
        type: 7, // REPORT
      });

      console.log(`🔔 Notification sent for report #${updatedReport._id}`);
    } else {
      console.log(
        `⚠️ No user found to notify for report #${updatedReport._id}`
      );
    }

    res.json(updatedReport);
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
    )
      .populate({
        path: "replyBy",
        model: "Admin",
        select: "-createdAt -updatedAt -isDelete",
        populate: {
          path: "userId",
          select:
            "-password -tokenId -createdAt -updatedAt -isDelete -roleId -isActive -isVerifiedPhone", // Loại bỏ trường nhạy cảm
        },
      })
      .populate({
        path: "bookingId",
        populate: {
          path: "customerId",
          populate: {
            path: "userId",
            select: "email fullName",
          },
        },
      });

    if (!get1Report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const user = get1Report?.bookingId?.customerId?.userId;
    console.log(get1Report?.bookingId?.customerId);
    const email = user?.email;

    const formattedDate = moment(get1Report.createdAt)
      .tz("Asia/Ho_Chi_Minh")
      .format("HH:mm:ss DD/MM/YYYY");
    const nowFormatted = moment()
      .tz("Asia/Ho_Chi_Minh")
      .format("DD/MM/YYYY HH:mm:ss");

    const contentText = `
      Hệ thống chúng tôi đã nhận đơn báo cáo của bạn vào thời gian ${formattedDate}, thông tin báo cáo của bạn bao gồm:
      - Mã đơn đặt phòng (bookingId): ${get1Report.bookingId?._id}
      - Lý do: ${get1Report.reason}
      - Nội dung: ${get1Report.content}
      Chúng tôi sẽ cố gắng xử lý đơn báo cáo của bạn trong thời gian sớm nhất.
      Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.
    `;

    // Gửi email nếu có email
    if (email) {
      const emailData = {
        to: email,
        subject: `Hệ thống đang xử lý đơn báo cáo của bạn (#${get1Report._id})`,
        text: contentText,
        html: `
          <p>Hệ thống chúng tôi đã nhận đơn báo cáo của bạn vào thời gian <b>${formattedDate}</b>, thông tin báo cáo của bạn bao gồm:</p>
          <ul>
            <li><b>Mã đơn đặt phòng (bookingId):</b> ${get1Report.bookingId?._id}</li>
            <li><b>Lý do:</b> ${get1Report.reason}</li>
            <li><b>Nội dung:</b> ${get1Report.content}</li>
          </ul>
          <p>Chúng tôi sẽ cố gắng xử lý đơn báo cáo của bạn trong thời gian sớm nhất.</p>
          <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
          <br/>
          <p><i>Đội ngũ team Mean</i></p>
        `,
      };

      await sendEmail(emailData);
      console.log(
        `✅ Email sent to user ${user.fullName} (${email}) for report #${get1Report._id}`
      );
    } else {
      console.log(
        `⚠️ No email found for user related to report #${get1Report._id}`
      );
    }

    // Gửi notification
    if (user?._id) {
      await Notification.create({
        userId: user._id,
        bookingId: get1Report.bookingId?._id,
        title: `Hệ thống đang xử lý đơn báo cáo của bạn (#${get1Report._id})`,
        content: `Báo cáo của bạn đã được tiếp nhận vào lúc ${nowFormatted}. Chúng tôi sẽ xử lý trong thời gian sớm nhất.`,
        type: 7, // REPORT
      });
      console.log(
        `🔔 Notification created for user ${user.fullName} (ID: ${user._id})`
      );
    } else {
      console.log(`⚠️ No user found to notify for report #${get1Report._id}`);
    }

    res.json(get1Report);
  } catch (error) {
    console.error("❌ Error in getReport:", error);
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
            select: "fullName", // Loại bỏ trường nhạy cảm
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
