const mongoose = require("mongoose"); // Erase if already required
const moment = require("moment-timezone");
const ACCOMMODATION_STATUS = Object.freeze({
    AVAILABLE: 1,
    BOOKED: 2,
    CLEANING: 3,
    PREPARING: 4,
    MAINTENANCE: 5,
    CLOSED: 6
});
var accommodationSchema = new mongoose.Schema(
    {
        rentalLocationId: {
            type: mongoose.Schema.ObjectId,
            ref: "RentalLocation",
        },
        accommodationTypeId: {
            type: mongoose.Schema.ObjectId,
            ref: "AccommodationType",
        },
        roomNo:{
            type: String,
        },
        description: {
            type: String,
            required: true,
        },
        image: [
            {
                type: String,
            },
        ],
        status: {
            type: Number,
            enum: Object.values(ACCOMMODATION_STATUS),
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
module.exports = mongoose.model("Accommodation", accommodationSchema);
