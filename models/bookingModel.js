const mongoose = require("mongoose"); // Erase if already required
const moment = require("moment-timezone");
const BOOKING_STATUS = Object.freeze({
  CONFIRMED: 1,
  NEEDCHECKIN: 2,
  CHECKEDIN: 3,
  NEEDCHECKOUT: 4,
  CHECKEDOUT: 5,
  CANCELLED: 6,
  COMPLETED: 7,
  PENDING: 8,
});

const PAYMENT_STATUS = Object.freeze({
  BOOKING: 1,
  PENDING: 2,
  PAID: 3,
  REFUND: 4,
  FAILED: 5,
});

// Declare the Schema of the Mongo model
var bookingSchema = new mongoose.Schema(
  {
    policySystemIds: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "PolicySystem",
      },
    ],
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
      type: Number,
      enum: Object.values(PAYMENT_STATUS),
    },
    adultNumber: {
      type: Number,
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
    },
    overtimeHourlyPrice: {
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
    passwordRoom: {
      type: String,
    },
    status: {
      type: Number,
      enum: Object.values(BOOKING_STATUS),
    },
    isDelete: {
      type: Boolean,
      default: false,
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
      .tz(this.checkInHour, "DD-MM-YYYY HH:mm:ss", "Asia/Ho_Chi_Minh")
      .utc()
      .toDate();
  }
  if (this.checkOutHour && typeof this.checkOutHour === "string") {
    // Chuyển đổi từ định dạng DD-MM-YYYY sang UTC
    this.checkOutHour = moment
      .tz(this.checkOutHour, "DD-MM-YYYY HH:mm:ss", "Asia/Ho_Chi_Minh")
      .utc()
      .toDate();
  }
  if (this.confirmDate && typeof this.confirmDate === "string") {
    // Chuyển đổi từ định dạng DD-MM-YYYY sang UTC
    this.confirmDate = moment
      .tz(this.confirmDate, "DD-MM-YYYY HH:mm:ss", "Asia/Ho_Chi_Minh")
      .utc()
      .toDate();
  }
  if (this.completedDate && typeof this.completedDate === "string") {
    // Chuyển đổi từ định dạng DD-MM-YYYY sang UTC
    this.completedDate = moment
      .tz(this.completedDate, "DD-MM-YYYY HH:mm:ss", "Asia/Ho_Chi_Minh")
      .utc()
      .toDate();
  }
});
//Export the model
module.exports = mongoose.model("Booking", bookingSchema);
