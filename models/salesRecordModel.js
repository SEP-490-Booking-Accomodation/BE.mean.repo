const mongoose = require("mongoose");
const moment = require("moment-timezone");

const salesRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    productType: {
      type: String,
      enum: ["EasyHRM", "iCare"],
      required: true,
      index: true,
    },

    sourceType: {
      type: String,
      enum: ["Marketing", "ChuDong", "CTV_DaiLy"],
      required: true,
      index: true,
    },

    customerCount: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },

    productQuantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },

    revenue: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    note: {
      type: String,
      default: "",
    },

    reportDate: {
      type: Date,
      required: true,
      index: true,
    },

    status: {
      type: Boolean,
      default: true,
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
  },
);

salesRecordSchema.index({
  userId: 1,
  createdAt: -1,
});

salesRecordSchema.index({
  productType: 1,
  sourceType: 1,
});

module.exports = mongoose.model("SalesRecord", salesRecordSchema);
