const mongoose = require("mongoose"); // Erase if already required
const moment = require("moment-timezone");
const RENTALLOCATION_STATUS = {
    PENDING : 1,
    INACTIVE : 2,
    ACTIVE : 3,
    PAUSE : 4
}
var rentalLocationSchema = new mongoose.Schema(
    {
        ownerId: {
            type: mongoose.Schema.ObjectId,
            ref: "Owner",
        },
        name: {
            type: String,
            required: true,
        },
        status: {
            type: Number,
            enum: Object.values(RENTALLOCATION_STATUS),
            default: RENTALLOCATION_STATUS.PENDING,
        },
        image: [
            {
                type: String,
            },
        ],
        description: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        longitude: {
            type: String,
        },
        altitude: {
            type: String,
        },
        openHour: {
            type: String,
            required: true,
        },
        closeHour: {
            type: String,
            required: true,
        },
        isOverNight: {
            type: Boolean,
            default: false
        },
        isDelete:{
            type: Boolean,
            default: false,
        }
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
module.exports = mongoose.model("RentalLocation", rentalLocationSchema);
