const mongoose = require("mongoose"); // Erase if already required
const moment = require("moment-timezone");

var accommodationTypeSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.ObjectId,
      ref: "Owner",
    },
    serviceIds: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Service",
      },
    ],
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: [],
    maxPeopleNumber: {
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
    numberOfPasswordRoom: {
      type: Number,
      required: true,
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
module.exports = mongoose.model("AccommodationType", accommodationTypeSchema);
