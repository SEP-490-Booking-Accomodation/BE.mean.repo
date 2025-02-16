const mongoose = require('mongoose'); // Erase if already required
const moment = require("moment-timezone");

// Declare the Schema of the Mongo model
var policySystemCategorySchema = new mongoose.Schema({
        categoryKey: {
            type: String,
            required: true,
        },
        categoryName: {
            type: String,
            required: true,
        },
        categoryDescription: {
            type: String,
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
                ret.createdAt = moment(ret.createdAt).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss');
                ret.updatedAt = moment(ret.updatedAt).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss');
                return ret;
            }
        },
        toObject: {
            virtuals: true,
            transform: (doc, ret) => {
                ret.createdAt = moment(ret.createdAt).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss');
                ret.updatedAt = moment(ret.updatedAt).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss');
                return ret;
            }
        }
    });

//Export the model
module.exports = mongoose.model('PolicySystemCategory', policySystemCategorySchema);