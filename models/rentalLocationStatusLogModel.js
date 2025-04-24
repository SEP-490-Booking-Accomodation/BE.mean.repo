const mongoose = require("mongoose");
const moment = require("moment-timezone");

const RENTAL_STATUS_LOG = {
    PENDING: 1,
    INACTIVE: 2,
    ACTIVE: 3,
    PAUSE: 4,
    DELETED: 5,
    NEEDS_UPDATE: 6,
};

const rentalLocationStatusLogSchema  = new mongoose.Schema({
        rentalLocationId: {
            type: mongoose.Schema.ObjectId,
            ref: "RentalLocation",
            required: true
        },
        oldStatus: {
            type: Number,
            enum: Object.values(RENTAL_STATUS_LOG),
            required: false
        },
        newStatus: {
            type: Number,
            enum: Object.values(RENTAL_STATUS_LOG),
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

const RentalLocationStatusLog = mongoose.model("RentalLocationStatusLog", rentalLocationStatusLogSchema);

module.exports = {
    RENTAL_STATUS_LOG,
    RentalLocationStatusLog
};