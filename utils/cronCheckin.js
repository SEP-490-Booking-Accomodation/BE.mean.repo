const cron = require("node-cron");
const moment = require("moment-timezone");

const Booking = require("../models/bookingModel");
const Notification = require("../models/notificationModel");

const bookingCheckInCron = () => {
  // Mỗi phút kiểm tra 1 lần
  cron.schedule("* * * * *", async () => {
    try {
      const now = moment();

      const bookings = await Booking.find({
        checkInHour: { $lte: now.toDate() },
        status: 1,
        paymentStatus: 3,
      });

      for (const booking of bookings) {
        // Kiểm tra xem đã có notification type 3 cho booking này chưa
        const existedNotification = await Notification.findOne({
          bookingId: booking._id,
          title: "Yêu cầu nhận phòng",
          type: 1,
        });

        if (existedNotification) {
          console.log(
            `[CRON] Notification đã tồn tại cho booking ${booking._id}, bỏ qua.`
          );
          continue;
        }

        // Cập nhật trạng thái booking
        booking.status = 2; // NEEDCHECKIN
        await booking.save();

        // Tạo notification mới
        await Notification.create({
          userId: booking.customerId,
          bookingId: booking._id,
          title: "Yêu cầu nhận phòng",
          content: `Đã đến giờ nhận phòng (${moment(booking.checkInHour).format(
            "HH:mm DD/MM/YYYY"
          )}), vui lòng thực hiện nhận phòng.`,
          type: 1,
          isRead: false,
        });

        console.log(
          `[CRON] Booking ${booking._id} được chuyển sang NEEDCHECKIN + Notification đã tạo.`
        );
      }
    } catch (err) {
      console.error("[CRON ERROR] Lỗi khi cập nhật NEEDCHECKIN:", err);
    }
  });
};

module.exports = bookingCheckInCron;
