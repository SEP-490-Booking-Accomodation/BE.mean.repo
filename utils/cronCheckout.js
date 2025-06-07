const cron = require("node-cron");
const moment = require("moment-timezone");
const Booking = require("../models/bookingModel");
const Notification = require("../models/notificationModel");

const bookingAutoCompleteCron = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = moment().tz("Asia/Ho_Chi_Minh");

      const bookings = await Booking.find({
        status: 2, // NEEDCHECKIN
        paymentStatus: 3,
        checkInHour: { $ne: null },
        durationBookingHour: { $ne: null },
      });

      for (const booking of bookings) {
        const endTime = moment(booking.checkInHour).add(
          booking.durationBookingHour,
          "hours"
        );

        if (now.isAfter(endTime)) {
          // Kiểm tra đã gửi notification chưa
          const existingNoti = await Notification.findOne({
            bookingId: booking._id,
            title: "Đặt phòng đã hoàn tất tự động",
            type: 1,
          });

          if (existingNoti) {
            console.log(
              `[CRON] Booking ${booking._id} đã gửi Notification trước đó. Bỏ qua.`
            );
            continue;
          }

          // Cập nhật trạng thái
          booking.status = 7; // COMPLETED
          await booking.save();

          // Tạo thông báo
          await Notification.create({
            userId: booking.customerId,
            bookingId: booking._id,
            title: "Đặt phòng đã hoàn tất tự động",
            content: `Đặt phòng của bạn đã kết thúc mà không nhận phòng. Hệ thống đã tự động chuyển trạng thái thành hoàn tất.`,
            type: 1,
            isRead: false,
          });

          console.log(
            `[CRON] Booking ${booking._id} chuyển COMPLETED + Đã gửi Notification.`
          );
        }
      }
    } catch (err) {
      console.error(
        "[CRON ERROR] Lỗi khi xử lý NEEDCHECKIN -> COMPLETED:",
        err
      );
    }
  });
};

module.exports = bookingAutoCompleteCron;
