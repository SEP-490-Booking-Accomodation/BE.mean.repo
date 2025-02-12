const mongoose = require("mongoose"); // Erase if already required
const moment = require("moment-timezone");
var businessInformationSchema = new mongoose.Schema(
    {
        companyName: {
            type: String,
            required: true,
        },
        representativeName: {
            type: String,
            required: true,
        },
        citizenIdentification: {
            type: String,
            required: true,
        },
        companyAddress: {
            type: String,
            required: true,
        },
        taxID: {
            type: String,
            required: true,
        },
        businessLicensesFile: {
            type: String,
            required: true,
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
module.exports = mongoose.model("BusinessInformation", businessInformationSchema);
