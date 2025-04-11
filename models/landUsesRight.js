const mongoose = require("mongoose"); // Erase if already required
const moment = require("moment-timezone");
var landUsesRightSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.ObjectId,
      ref: "Admin",
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
    try {
        
        const parseDate = (dateStr, fieldName) => {
            if (!dateStr) return undefined;
            if (!(typeof dateStr === "string")) return dateStr; 

            const parsedDate = moment.tz(dateStr, [
                "DD/MM/YYYY HH:mm:ss", 
                "DD-MM-YYYY HH:mm:ss",
                "YYYY-MM-DD HH:mm:ss",
                "DD/MM/YYYY",
                "DD-MM-YYYY"
            ], "Asia/Ho_Chi_Minh");
            
            if (!parsedDate.isValid()) {
                throw new Error(`Invalid date format for ${fieldName}: ${dateStr}`);
            }
            
            return parsedDate.utc().toDate();
        };
        
        // Parse date fields
        if (this.uploadDate) {
            this.uploadDate = parseDate(this.uploadDate, 'uploadDate');
        }
        
        if (this.approvedDate) {
            this.approvedDate = parseDate(this.approvedDate, 'approvedDate');
        }
        
        if (this.refuseDate) {
            this.refuseDate = parseDate(this.refuseDate, 'refuseDate');
        }
        
        next();
    } catch (error) {
        next(error);
    }
});
//Export the model
module.exports = mongoose.model("LandUsesRight", landUsesRightSchema);
