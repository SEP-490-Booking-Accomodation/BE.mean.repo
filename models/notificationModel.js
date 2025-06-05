const mongoose = require("mongoose"); // Erase if already required
const moment = require("moment-timezone");
const TYPE = Object.freeze({
  BOOKING: 1,
  FEEDBACK: 2,
  PAYMENT: 3,
  USER: 4,
});

// Declare the Schema of the Mongo model
var notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    bookingId: {
      type: mongoose.Schema.ObjectId,
      ref: "Booking",
    },
    title: {
      type: String,
    },
    content: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    type: {
      type: Number,
      enum: Object.values(TYPE),
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
        return ret;
      },
    },
  }
);

//Export the model
module.exports = mongoose.model("Notification", notificationSchema);
