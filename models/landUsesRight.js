const mongoose = require("mongoose"); // Erase if already required
const moment = require("moment-timezone");
var landUsesRightSchema = new mongoose.Schema(
    {
        staffId: {
            type: mongoose.Schema.ObjectId,
            ref: "Staff",
        },
        rentalLocationId: {
            type: mongoose.Schema.ObjectId,
            ref: "RentalLocation",
        },
        documentName: {
            type: String,
        },
        documentType: {
            type: String,
        },
        documentStatus: {
            type: Boolean,
            default: false,
        },
        documentFile: [],
        uploadDate: {
            type: Date,
        },
        approvedDate: {
            type: Date,
        },
        refuseDate: {
            type: Date,
        },
        note: {
            type: String,
        },
        isDelete: {
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
                if (ret.uploadDate) {
                    ret.uploadDate = moment(ret.uploadDate)
                        .tz("Asia/Ho_Chi_Minh")
                        .format("DD/MM/YYYY HH:mm:ss");
                }
                if (ret.approvedDate) {
                    ret.approvedDate = moment(ret.approvedDate)
                        .tz("Asia/Ho_Chi_Minh")
                        .format("DD/MM/YYYY HH:mm:ss");
                }
                if (ret.refuseDate) {
                    ret.refuseDate = moment(ret.refuseDate)
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
                if (ret.uploadDate) {
                    ret.uploadDate = moment(ret.uploadDate)
                        .tz("Asia/Ho_Chi_Minh")
                        .format("DD/MM/YYYY HH:mm:ss");
                }
                if (ret.approvedDate) {
                    ret.approvedDate = moment(ret.approvedDate)
                        .tz("Asia/Ho_Chi_Minh")
                        .format("DD/MM/YYYY HH:mm:ss");
                }
                if (ret.refuseDate) {
                    ret.refuseDate = moment(ret.refuseDate)
                        .tz("Asia/Ho_Chi_Minh")
                        .format("DD/MM/YYYY HH:mm:ss");
                }
                return ret;
            },
        },
    }
);
landUsesRightSchema.pre("save", async function (next) {
    if (this.uploadDate && typeof this.uploadDate === "string") {
            // Chuyển đổi từ định dạng DD-MM-YYYY sang UTC
            this.uploadDate = moment
                .tz(this.uploadDate, "DD-MM-YYYY HH:mm:ss", "Asia/Ho_Chi_Minh")
                .utc()
                .toDate();
        }
    if (this.approvedDate && typeof this.approvedDate === "string") {
        // Chuyển đổi từ định dạng DD-MM-YYYY sang UTC
        this.approvedDate = moment
            .tz(this.approvedDate, "DD-MM-YYYY HH:mm:ss", "Asia/Ho_Chi_Minh")
            .utc()
            .toDate();
    }
    if (this.refuseDate && typeof this.refuseDate === "string") {
        // Chuyển đổi từ định dạng DD-MM-YYYY sang UTC
        this.refuseDate = moment
            .tz(this.refuseDate, "DD-MM-YYYY HH:mm:ss", "Asia/Ho_Chi_Minh")
            .utc()
            .toDate();
    }
});
//Export the model
module.exports = mongoose.model("LandUsesRight", landUsesRightSchema);
