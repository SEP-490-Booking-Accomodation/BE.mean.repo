// models/coQuanBhxhModel.js

const mongoose = require("mongoose");
const moment = require("moment-timezone");

const coQuanBhxhSchema = new mongoose.Schema(
    {
        agencyCode: {
            type: String,
            required: true,
            unique: true,
        },

        agencyName: {
            type: String,
            required: true,
        },

        provinceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Province",
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
    }
);

module.exports = mongoose.model("CoQuanBHXH", coQuanBhxhSchema);