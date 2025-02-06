const mongoose = require("mongoose"); // Erase if already required
const moment = require("moment-timezone");
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
            type: Boolean,
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
