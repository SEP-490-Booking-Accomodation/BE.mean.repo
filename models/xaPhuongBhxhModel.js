// models/xaPhuongBhxhModel.js

const mongoose = require("mongoose");

const xaPhuongBhxhSchema = new mongoose.Schema(
  {
    wardCode: {
      type: String,
      required: true,
    },

    wardName: {
      type: String,
      required: true,
    },

    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoQuanBHXH",
      required: true,
    },

    provinceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Province",
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

module.exports = mongoose.model("XaPhuongBHXH", xaPhuongBhxhSchema);
