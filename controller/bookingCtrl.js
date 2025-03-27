const Booking = require("../models/bookingModel");
const Transaction = require("../models/transactionModel");
const RentalLocation = require("../models/rentalLocationModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const softDelete = require("../utils/softDelete");
const Accommodation = require("../models/accommodationModel");
const AccommodationType = require("../models/accommodationTypeModel");
const moment = require("moment-timezone");
const crypto = require("crypto");
const axios = require("axios");

const createBooking = asyncHandler(async (req, res) => {
    try {
        const {
            policySystemBookingId,
            customerId,
            accommodationTypeId,
            couponId,
            feedbackId,
            checkInHour,
            checkOutHour,
            confirmDate,
            paymentMethod,
            paymentStatus,
            basePrice,
            overtimeHourlyPrice,
            adultNumber,
            childNumber,
            durationBookingHour,
            completedDate,
            passwordRoom,
            status,
        } = req.body;

        const vietnamTime1 = checkInHour
            ? moment(checkInHour, "DD-MM-YYYY HH:mm:ss")
                .tz("Asia/Ho_Chi_Minh")
                .toDate()
            : null;
        const vietnamTime2 = checkOutHour
            ? moment(checkOutHour, "DD-MM-YYYY HH:mm:ss")
                .tz("Asia/Ho_Chi_Minh")
                .toDate()
            : null;
        const vietnamTime3 = confirmDate
            ? moment(confirmDate, "DD-MM-YYYY HH:mm:ss")
                .tz("Asia/Ho_Chi_Minh")
                .toDate()
            : null;
        const vietnamTime4 = completedDate
            ? moment(completedDate, "DD-MM-YYYY HH:mm:ss")
                .tz("Asia/Ho_Chi_Minh")
                .toDate()
            : null;

        // Tìm các phòng có accommodationTypeId và còn trống trong khoảng thời gian này
        const availableRoom = await Accommodation.findOne({
            accommodationTypeId,
            status: "1",
            _id: {
                $nin: await Booking.distinct("accommodationId", {
                    accommodationTypeId,
                    $or: [
                        {
                            checkInHour: {$lt: vietnamTime1},
                            checkOutHour: {$gt: vietnamTime2},
                        },
                    ],
                }),
            },
        });

        console.log(availableRoom);

        if (!availableRoom) {
            return res
                .status(400)
                .json({message: "No available rooms for this time slot."});
        }

        const newBooking = new Booking({
            policySystemBookingId,
            customerId,
            accommodationId: availableRoom._id,
            couponId,
            feedbackId,
            checkInHour: vietnamTime1,
            checkOutHour: vietnamTime2,
            confirmDate: vietnamTime3,
            paymentMethod,
            paymentStatus,
            basePrice,
            overtimeHourlyPrice,
            adultNumber,
            childNumber,
            durationBookingHour,
            completedDate: vietnamTime4,
            passwordRoom,
            status,
        });

        await newBooking.save();

        res.status(201).json({
            message: "Booking created successfully",
            booking: newBooking,
        });
    } catch (error) {
        throw new Error(error);
    }
});

// const updateBooking = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   validateMongoDbId(id);
//   try {
//     const updateBooking = await Booking.findByIdAndUpdate(id, req.body, {
//       new: true,
//     });
//     res.json(updateBooking);
//   } catch (error) {
//     throw new Error(error);
//   }
// });
const updateBooking = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);

    try {
        const updateData = {...req.body};

        if (updateData.checkInHour) {
            updateData.checkInHour = moment(
                updateData.checkInHour,
                "DD-MM-YYYY HH:mm:ss"
            )
                .tz("Asia/Ho_Chi_Minh")
                .toDate();
        }

        if (updateData.checkOutHour) {
            updateData.checkOutHour = moment(
                updateData.checkOutHour,
                "DD-MM-YYYY HH:mm:ss"
            )
                .tz("Asia/Ho_Chi_Minh")
                .toDate();
        }

        if (updateData.confirmDate) {
            updateData.confirmDate = moment(
                updateData.confirmDate,
                "DD-MM-YYYY HH:mm:ss"
            )
                .tz("Asia/Ho_Chi_Minh")
                .toDate();
        }

        if (updateData.completedDate) {
            updateData.completedDate = moment(
                updateData.completedDate,
                "DD-MM-YYYY HH:mm:ss"
            )
                .tz("Asia/Ho_Chi_Minh")
                .toDate();
        }

        const updatedBooking = await Booking.findByIdAndUpdate(id, updateData, {
            new: true,
        });

        if (!updatedBooking) {
            return res.status(404).json({message: "Booking not found"});
        }

        res.json({
            message: "Booking updated successfully",
            booking: updatedBooking,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const deleteBooking = asyncHandler(async (req, res) => {
    const {id} = req.params;

    try {
        const deletedBooking = await softDelete(Booking, id);

        if (!deletedBooking) {
            return res.status(404).json({message: "Booking not found"});
        }

        res.json({message: "Booking deleted successfully", data: deletedBooking});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

const processMoMoPayment = async (req, res) => {
    try {
        const {bookingId, amount, description} = req.body;
        if (!bookingId || !amount) {
            return res.status(400).json({message: "Missing required fields"});
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({message: "Booking not found"});
        }

        const partnerCode = process.env.MOMO_PARTNER_CODE;
        const accessKey = process.env.MOMO_ACCESS_KEY;
        const secretKey = process.env.MOMO_SECRET_KEY;
        const requestId = partnerCode + new Date().getTime();
        const orderId = requestId;
        const orderInfo = description || "Payment for booking";
        const returnUrl = process.env.MOMO_RETURN_URL;
        const notifyUrl = process.env.MOMO_NOTIFY_URL;
        const extraData = "";
        const requestType = "captureWallet";

        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${notifyUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${returnUrl}&requestId=${requestId}&requestType=${requestType}`;
        const signature = crypto
            .createHmac("sha256", secretKey)
            .update(rawSignature)
            .digest("hex");

        const momoRequest = {
            partnerCode,
            accessKey,
            requestId,
            amount,
            orderId,
            orderInfo,
            redirectUrl: returnUrl,
            ipnUrl: notifyUrl,
            requestType,
            extraData,
            lang: "en",
            signature,
        };

        const momoResponse = await axios.post(
            "https://test-payment.momo.vn/v2/gateway/api/create",
            momoRequest
        );

        if (momoResponse.data && momoResponse.data.payUrl) {
            const transaction = new Transaction({
                bookingId,
                paymentCode: orderId,
                amount,
                description,
                typeTransaction: 1, // 1: MoMo payment
                transactionStatus: 1, // Pending
            });
            await transaction.save();

            return res.json({payUrl: momoResponse.data.payUrl});
        } else {
            return res.status(500).json({message: "Failed to initiate payment"});
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Server error"});
    }
};

const processMomoCallback = async (req, res) => {
    console.log("Callback:");
    console.log(req.body);

    return res.status(200).json(req.body);
};

const processMoMoNotify = async (req, res) => {
    try {
        const {
            orderId,
            requestId,
            resultCode,
            message,
            transId,
            amount,
            responseTime,
            extraData,
        } = req.body;

        console.log("MoMo Notify Received:", req.body);

        // Tìm giao dịch dựa trên orderId
        const transaction = await Transaction.findOne({paymentCode: orderId});

        if (!transaction) {
            return res.status(404).json({message: "Transaction not found"});
        }

        // Kiểm tra trạng thái thanh toán từ MoMo
        if (resultCode === 0) {
            transaction.transactionStatus = 2; // Đánh dấu đã thanh toán
            transaction.transactionEndDate = new Date(responseTime);
        } else {
            transaction.transactionStatus = 3; // Thanh toán thất bại
        }

        await transaction.save();

        return res.json({message: "Notification processed successfully"});
    } catch (error) {
        console.error("MoMo Notify Error:", error);
        return res.status(500).json({message: "Server error"});
    }
};

const getBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const get1Booking = await Booking.findOne({ _id: id, isDelete: false })
      .populate("accommodationId")
      .populate("policySystemBookingId")
      .populate({
        path: "customerId",
        populate: { path: "userId", select: "fullName" },
      });
    res.json(get1Booking);
  } catch (error) {
    throw new Error(error);
  }
});

const getBookingsByCustomerId = asyncHandler(async (req, res) => {
    const {customerId} = req.params;
    validateMongoDbId(customerId);
    try {
        const bookings = await Booking.find({customerId, isDelete: false});
        if (bookings.length === 0) {
            return res
                .status(404)
                .json({message: "No bookings found for this customer"});
        }
        res.json({
            message: "Bookings retrieved successfully",
            bookings,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const getBookingsByRentalLocation = asyncHandler(async (req, res) => {
    const {rentalLocationId} = req.params;

    try {
        // 1. Tìm tất cả accommodation theo rentalLocationId
        const accommodations = await Accommodation.find({
            rentalLocationId,
        }).select("_id");
        const accommodationIds = accommodations.map((a) => a._id);

        if (accommodationIds.length === 0) {
            return res
                .status(404)
                .json({message: "No accommodations found for this rental location."});
        }

        // 2. Lấy tất cả booking liên quan
        const bookings = await Booking.find({
            accommodationId: {$in: accommodationIds},
        })
            .populate("accommodationId")
            .populate({
                path: "customerId",
                populate: {path: "userId", select: "fullName"},
            });

        const formattedBookings = bookings.map((booking, index) => ({
            [`booking_${index + 1}`]: booking,
        }));

        res.status(200).json({
            total: bookings.length,
            bookings: formattedBookings,
        });
    } catch (error) {
        res
            .status(500)
            .json({message: "Failed to get bookings", error: error.message});
    }
});

const getAllBooking = asyncHandler(async (req, res) => {
    try {
        const getAllBooking = await Booking.find({isDelete: false})
            .populate("accommodationId")
            .populate("policySystemBookingId")
            .populate({
                path: "customerId",
                populate: {path: "userId", select: "fullName"},
            });
        res.json(getAllBooking);
    } catch (error) {
        throw new Error(error);
    }
});

const getBookingsByOwner = asyncHandler(async (req, res) => {
    const {ownerId} = req.params;

    try {
        // 1. Find all rental locations owned by this owner
        const rentalLocations = await RentalLocation.find({ownerId}).select("_id");
        const rentalLocationIds = rentalLocations.map(loc => loc._id);

        if (rentalLocationIds.length === 0) {
            return res
                .status(404)
                .json({message: "No rental locations found for this owner."});
        }

        // 2. Find all accommodations belonging to these rental locations
        const accommodations = await Accommodation.find({
            rentalLocationId: {$in: rentalLocationIds}
        }).select("_id");
        const accommodationIds = accommodations.map(a => a._id);

        if (accommodationIds.length === 0) {
            return res
                .status(404)
                .json({message: "No accommodations found for this owner's rental locations."});
        }

        // 3. Get all bookings related to these accommodations
        const bookings = await Booking.find({
            accommodationId: {$in: accommodationIds}
        })
            .populate({
                path: "accommodationId",
                populate: [
                    {
                        path: "rentalLocationId",
                        select: "name address openHour closeHour ward district city"
                    },
                    {
                        path: "accommodationTypeId",
                        select: "name maxPeopleNumber basePrice overtimeHourlyPrice"
                    }
                ]
            })
            .populate({
                path: "customerId",
                populate: {path: "userId", select: "fullName"}
            });

        const formattedBookings = bookings.map((booking, index) => ({
            [`booking_${index + 1}`]: booking
        }));

        res.status(200).json({
            total: bookings.length,
            bookings: formattedBookings
        });
    } catch (error) {
        res
            .status(500)
            .json({message: "Failed to get bookings", error: error.message});
    }
});

module.exports = {
    createBooking,
    updateBooking,
    deleteBooking,
    getBooking,
    getBookingsByCustomerId,
    getBookingsByOwner,
    getBookingsByRentalLocation,
    getAllBooking,
    processMoMoPayment,
    processMoMoNotify,
    processMomoCallback,
};
