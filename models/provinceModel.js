// models/provinceModel.js

const mongoose = require("mongoose");

const provinceSchema = new mongoose.Schema(
  {
    provinceCode: {
      type: String,
      required: true,
      unique: true,
    },
    provinceName: {
      type: String,
      required: true,
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

module.exports = mongoose.model("Province", provinceSchema);
