const mongoose = require("mongoose"); // Erase if already required
const moment = require("moment-timezone");

// Declare the Schema of the Mongo model
var bookingSchema = new mongoose.Schema(
  {
    policySystemBookingId: {
      type: mongoose.Schema.ObjectId,
      ref: "PolicySystemBooking",
    },
    customerId: {
      type: mongoose.Schema.ObjectId,
      ref: "Customer",
    },
    accommodationId: {
      type: mongoose.Schema.ObjectId,
      ref: "Accommodation",
    },
    couponId: {
      type: mongoose.Schema.ObjectId,
      ref: "Coupon",
    },
    feedbackId: {
      type: mongoose.Schema.ObjectId,
      ref: "Feedback",
    },
    checkInHour: {
      type: Date,
      required: true,
    },
    checkOutHour: {
      type: Date,
    },
    confirmDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      default: "Chờ thanh toán",
    },
    downPrice: {
      type: Number,
    },
    roomPrice: {
      type: Number,
      required: true,
    },
    adultNumber: {
      type: Number,
      required: true,
    },
    childNumber: {
      type: Number,
      required: true,
    },
    durationBookingHour: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    isFullPay: {
      type: Boolean,
      default: false,
    },
    isPayOnlyDeposit: {
      type: Boolean,
      default: false,
    },
    isCancel: {
      type: Boolean,
      default: false,
    },
    completedDate: {
      type: Date,
    },
    haveEKey: {
      type: Boolean,
      default: false,
    },
    eKeyNo: {
      type: String,
    },
    status: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.createdAt = moment(ret.createdAt)
          .tz("Asia/Ho_Chi_Minh")
          .format("DD/MM/YYYY HH:mm:ss");
        ret.updatedAt = moment(ret.updatedAt)
          .tz("Asia/Ho_Chi_Minh")
          .format("DD/MM/YYYY HH:mm:ss");
        if (ret.checkInHour) {
          ret.checkInHour = moment(ret.checkInHour)
            .tz("Asia/Ho_Chi_Minh")
            .format("DD/MM/YYYY HH:mm:ss");
        }
        if (ret.checkOutHour) {
          ret.checkOutHour = moment(ret.checkOutHour)
            .tz("Asia/Ho_Chi_Minh")
            .format("DD/MM/YYYY HH:mm:ss");
        }
        if (ret.confirmDate) {
          ret.confirmDate = moment(ret.confirmDate)
            .tz("Asia/Ho_Chi_Minh")
            .format("DD/MM/YYYY HH:mm:ss");
        }
        if (ret.completedDate) {
          ret.completedDate = moment(ret.completedDate)
            .tz("Asia/Ho_Chi_Minh")
            .format("DD/MM/YYYY HH:mm:ss");
        }
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.createdAt = moment(ret.createdAt)
          .tz("Asia/Ho_Chi_Minh")
          .format("DD/MM/YYYY HH:mm:ss");
        ret.updatedAt = moment(ret.updatedAt)
          .tz("Asia/Ho_Chi_Minh")
          .format("DD/MM/YYYY HH:mm:ss");
        if (ret.checkInHour) {
          ret.checkInHour = moment(ret.checkInHour)
            .tz("Asia/Ho_Chi_Minh")
            .format("DD/MM/YYYY HH:mm:ss");
        }
        if (ret.checkOutHour) {
          ret.checkOutHour = moment(ret.checkOutHour)
            .tz("Asia/Ho_Chi_Minh")
            .format("DD/MM/YYYY HH:mm:ss");
        }
        if (ret.confirmDate) {
          ret.confirmDate = moment(ret.confirmDate)
            .tz("Asia/Ho_Chi_Minh")
            .format("DD/MM/YYYY HH:mm:ss");
        }
        if (ret.completedDate) {
          ret.completedDate = moment(ret.completedDate)
            .tz("Asia/Ho_Chi_Minh")
            .format("DD/MM/YYYY HH:mm:ss");
        }
        return ret;
      },
    },
  }
);
bookingSchema.pre("save", async function (next) {
  if (this.checkInHour && typeof this.checkInHour === "string") {
    // Chuyển đổi từ định dạng DD-MM-YYYY sang UTC
    this.checkInHour = moment
      .tz(this.checkInHour, "DD-MM-YYYY", "Asia/Ho_Chi_Minh")
      .utc()
      .toDate();
  }
  if (this.checkOutHour && typeof this.checkOutHour === "string") {
    // Chuyển đổi từ định dạng DD-MM-YYYY sang UTC
    this.checkOutHour = moment
      .tz(this.checkOutHour, "DD-MM-YYYY", "Asia/Ho_Chi_Minh")
      .utc()
      .toDate();
  }
  if (this.confirmDate && typeof this.confirmDate === "string") {
    // Chuyển đổi từ định dạng DD-MM-YYYY sang UTC
    this.confirmDate = moment
      .tz(this.confirmDate, "DD-MM-YYYY", "Asia/Ho_Chi_Minh")
      .utc()
      .toDate();
  }
  if (this.completedDate && typeof this.completedDate === "string") {
    // Chuyển đổi từ định dạng DD-MM-YYYY sang UTC
    this.completedDate = moment
      .tz(this.completedDate, "DD-MM-YYYY", "Asia/Ho_Chi_Minh")
      .utc()
      .toDate();
  }
});
//Export the model
module.exports = mongoose.model("Booking", bookingSchema);
