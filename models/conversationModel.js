const mongoose = require("mongoose"); // Erase if already required
const moment = require("moment-timezone");
var conversationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
        },
        joinDate: {
            type: Date,
            default: () => moment().tz("Asia/Ho_Chi_Minh").toDate(),
        },
        status: {
            type: Boolean,
            default: false,
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

                if (ret.joinDate) {
                    ret.joinDate = moment(ret.joinDate)
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

                if (ret.joinDate) {
                    ret.joinDate = moment(ret.joinDate)
                        .tz("Asia/Ho_Chi_Minh")
                        .format("DD/MM/YYYY HH:mm:ss");
                }

                return ret;
            },
        },
    }
);

//Export the model
module.exports = mongoose.model("Conversation", conversationSchema);
