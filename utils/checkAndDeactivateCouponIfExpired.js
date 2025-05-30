const moment = require("moment-timezone");

/**
 * Kiểm tra nếu coupon đã hết hạn thì cập nhật isActive = false
 * @param {Object} coupon - Mongoose coupon document
 * @returns {Object} - Updated coupon
 */
const checkAndDeactivateCouponIfExpired = async (coupon) => {
  const now = moment().tz("Asia/Ho_Chi_Minh");
  if (moment(coupon.endDate).isBefore(now) && coupon.isActive) {
    coupon.isActive = false;
    await coupon.save();
  }
  return coupon;
};

module.exports = checkAndDeactivateCouponIfExpired;
