const mongoose = require("mongoose"); // Erase if already required
const moment = require("moment-timezone");
const TYPE_TRANSACTION = Object.freeze({
  MOMO_PAYMENT: 1,
  PAYOS_PAYMENT: 2,
});
const TRANSACTION_STATUS = Object.freeze({
  PENDING: 1,
  COMPLETED: 2,
  FAILED: 3,
});

var transactionSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.ObjectId,
      ref: "Booking",
    },
    ownerId: {
      type: mongoose.Schema.ObjectId,
      ref: "Owner",
    },
    paymentCode: {
      type: String,
      required: true,
    },
    transactionEndDate: {
      type: Date,
    },
    transactionStatus: {
      type: Number,
      enum: Object.values(TRANSACTION_STATUS),
    },
    description: {
      type: String,
    },
    typeTransaction: {
      type: Number,
      enum: Object.values(TYPE_TRANSACTION),
    },
    amount: {
      type: Number,
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
        ret.transactionCreatedDate = moment(ret.createdAt)
          .tz("Asia/Ho_Chi_Minh")
          .format("DD/MM/YYYY HH:mm:ss");
        ret.updatedAt = moment(ret.updatedAt)
          .tz("Asia/Ho_Chi_Minh")
          .format("DD/MM/YYYY HH:mm:ss");
        if (ret.transactionEndDate) {
          ret.transactionEndDate = moment(ret.transactionEndDate)
            .tz("Asia/Ho_Chi_Minh")
            .format("DD/MM/YYYY HH:mm:ss");
        }
        delete ret.createdAt;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.transactionCreatedDate = moment(ret.createdAt)
          .tz("Asia/Ho_Chi_Minh")
          .format("DD/MM/YYYY HH:mm:ss");
        ret.updatedAt = moment(ret.updatedAt)
          .tz("Asia/Ho_Chi_Minh")
          .format("DD/MM/YYYY HH:mm:ss");
        if (ret.transactionEndDate) {
          ret.transactionEndDate = moment(ret.transactionEndDate)
            .tz("Asia/Ho_Chi_Minh")
            .format("DD/MM/YYYY HH:mm:ss");
        }
        delete ret.createdAt;
        return ret;
      },
    },
  }
);
transactionSchema.pre("validate", function (next) {
  if (!this.bookingId && !this.ownerId) {
    this.invalidate(
      "bookingId",
      "Either bookingId or ownerId must be provided."
    );
    this.invalidate("ownerId", "Either bookingId or ownerId must be provided.");
  }
  next();
});
transactionSchema.pre("save", async function (next) {
  if (this.transactionEndDate && typeof this.transactionEndDate === "string") {
    this.transactionEndDate = moment
      .tz(this.transactionEndDate, "DD-MM-YYYY", "Asia/Ho_Chi_Minh")
      .utc()
      .toDate();
  }
});
//Export the model
module.exports = mongoose.model("Transaction", transactionSchema);
