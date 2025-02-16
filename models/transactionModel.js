const mongoose = require("mongoose"); // Erase if already required
const moment = require("moment-timezone");
var transactionSchema = new mongoose.Schema(
    {
        bookingId: {
            type: mongoose.Schema.ObjectId,
            ref: "Booking",
        },
        paymentCode: {
            type: String,
            required: true,
        },
        transactionEndDate: {
            type: Date,
        },
        transactionStatus: {
            type: Boolean,
            default: false,
        },
        description: {
            type: String,
        },
        typeTransaction: {
            type: Number,
            default: 1
        },
        amount: {
            type: Number,
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
                ret.transactionCreatedDate = moment(ret.createdAt)
                    .tz("Asia/Ho_Chi_Minh")
                    .format("DD/MM/YYYY HH:mm:ss");
                ret.updatedAt = moment(ret.updatedAt)
                    .tz("Asia/Ho_Chi_Minh")
                    .format("DD/MM/YYYY HH:mm:ss");
                if (ret.transactionEndDate) {
                    ret.transactionEndDate = moment(ret.transactionEndDate)
                        .tz("Asia/Ho_Chi_Minh")
                        .format("DD/MM/YYYY HH:mm:ss");
                }
                delete ret.createdAt;
                return ret;
            },
        },
        toObject: {
            virtuals: true,
            transform: (doc, ret) => {
                ret.transactionCreatedDate = moment(ret.createdAt)
                    .tz("Asia/Ho_Chi_Minh")
                    .format("DD/MM/YYYY HH:mm:ss");
                ret.updatedAt = moment(ret.updatedAt)
                    .tz("Asia/Ho_Chi_Minh")
                    .format("DD/MM/YYYY HH:mm:ss");
                if (ret.transactionEndDate) {
                    ret.transactionEndDate = moment(ret.transactionEndDate)
                        .tz("Asia/Ho_Chi_Minh")
                        .format("DD/MM/YYYY HH:mm:ss");
                }
                delete ret.createdAt;
                return ret;
            },
        },
    }
);
transactionSchema.pre("save", async function (next) {
    if (this.transactionEndDate && typeof this.transactionEndDate === "string") {
        this.transactionEndDate = moment
            .tz(this.transactionEndDate, "DD-MM-YYYY", "Asia/Ho_Chi_Minh")
            .utc()
            .toDate();
    }
});
//Export the model
module.exports = mongoose.model("Transaction", transactionSchema);
