const mongoose = require("mongoose"); // Erase if already required
const moment = require("moment-timezone");

const OWNER_STATUS_LOG = {
    APPROVING: 1,
    APPROVED: 2,
    DENIED: 3
};

const ownerStatusLogSchema  = new mongoose.Schema({
        ownerId: {
            type: mongoose.Schema.ObjectId,
            ref: "Owner",
            required: true
        },
        oldStatus: {
            type: Number,
            enum: Object.values(OWNER_STATUS_LOG),
            required: false
        },
        newStatus: {
            type: Number,
            enum: Object.values(OWNER_STATUS_LOG),
            required: false
        },
        note: {
            type: String
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

const OwnerStatusLog = mongoose.model("OwnerStatusLog", ownerStatusLogSchema);

module.exports = {
    OWNER_STATUS_LOG,
    OwnerStatusLog
};