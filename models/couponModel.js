const mongoose = require("mongoose"); // Erase if already required
const moment = require("moment-timezone");

// Declare the Schema of the Mongo model
var couponSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        startDate: {
            type: Date,
            require: true,
        },
        endDate: {
            type: Date,
            require: true,
        },
        discountBasedOn: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        maxDiscount: {
            type: Number,
            required: true,
        },
        isActive: {
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
                if (ret.startDate) {
                    ret.startDate = moment(ret.startDate)
                        .tz("Asia/Ho_Chi_Minh")
                        .format("DD/MM/YYYY HH:mm:ss");
                }
                if (ret.endDate) {
                    ret.endDate = moment(ret.endDate)
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
                if (ret.startDate) {
                    ret.startDate = moment(ret.startDate)
                        .tz("Asia/Ho_Chi_Minh")
                        .format("DD/MM/YYYY HH:mm:ss");
                }
                if (ret.endDate) {
                    ret.endDate = moment(ret.endDate)
                        .tz("Asia/Ho_Chi_Minh")
                        .format("DD/MM/YYYY HH:mm:ss");
                }
                return ret;
            },
        },
    }
);
couponSchema.pre("save", async function (next) {
    if (this.startDate && typeof this.startDate === "string") {
        // Chuyển đổi từ định dạng DD-MM-YYYY sang UTC
        this.startDate = moment
            .tz(this.startDate, "DD-MM-YYYY", "Asia/Ho_Chi_Minh")
            .utc()
            .toDate();
    }
    if (this.endDate && typeof this.endDate === "string") {
        // Chuyển đổi từ định dạng DD-MM-YYYY sang UTC
        this.endDate = moment
            .tz(this.endDate, "DD-MM-YYYY", "Asia/Ho_Chi_Minh")
            .utc()
            .toDate();
    }
});
//Export the model
module.exports = mongoose.model("Coupon", couponSchema);
