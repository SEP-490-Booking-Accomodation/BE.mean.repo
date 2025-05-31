const Coupon = require("../models/couponModel");
const moment = require("moment-timezone");

/**
 * Kiểm tra tất cả coupon đã hết hạn và cập nhật isActive = false nếu cần
 */
const deactivateExpiredCoupons = async () => {
  const now = moment().tz("Asia/Ho_Chi_Minh").toDate();

  const result = await Coupon.updateMany(
    {
      endDate: { $lt: now },
      isActive: true,
      isDelete: false,
    },
    { $set: { isActive: false } }
  );

  const modifiedCount = result.modifiedCount || 0;
  const message =
    modifiedCount > 0
      ? `${modifiedCount} expired coupon(s) deactivated.`
      : "No expired coupon to deactivate.";

  return { modifiedCount, message };
};

module.exports = deactivateExpiredCoupons;
