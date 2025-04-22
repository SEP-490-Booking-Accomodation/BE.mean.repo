const mongoose = require("mongoose"); // Erase if already required
const moment = require("moment-timezone");

// Declare the Schema of the Mongo model

const OWNER_MODEL_STATUS_LOG = {
  APPROVING: 1,
  APPROVED: 2,
  DENIED: 3
};

var ownerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    paymentInformationId: {
      type: mongoose.Schema.ObjectId,
      ref: "PaymentInformation",
    },
    businessInformationId: {
      type: mongoose.Schema.ObjectId,
      ref: "BusinessInformation",
    },
    approvalStatus: {
      type: Number,
      enum: Object.values(OWNER_MODEL_STATUS_LOG),
      default: OWNER_MODEL_STATUS_LOG.APPROVING,
    },
    note: {
      type: String,
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

const Owner = mongoose.model("Owner", ownerSchema);

//Export the model
module.exports = {
    OWNER_MODEL_STATUS_LOG,
    Owner,
};

