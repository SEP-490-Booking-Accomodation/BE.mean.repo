const Booking = require("../models/bookingModel");
const Transaction = require("../models/transactionModel");
const RentalLocation = require("../models/rentalLocationModel");
const PolicySystem = require("../models/policySystemModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const softDelete = require("../utils/softDelete");
const Accommodation = require("../models/accommodationModel");
const AccommodationType = require("../models/accommodationTypeModel");
const moment = require("moment-timezone");
const crypto = require("crypto");
const mongoose = require("mongoose");
const axios = require("axios");

const createBooking = asyncHandler(async (req, res) => {
  try {
    const {
      policySystemIds,
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
      totalPrice,
      passwordRoom,
      note,
      timeExpireRefund,
      status,
    } = req.body;

    const vietnamTimeNow = moment().tz("Asia/Ho_Chi_Minh");

    const vietnamTime1 = checkInHour
      ? moment(checkInHour, "DD-MM-YYYY HH:mm:ss")
          .tz("Asia/Ho_Chi_Minh")
          .toDate()
      : null;

    if (vietnamTime1 && moment(vietnamTime1).isBefore(vietnamTimeNow)) {
      return res
        .status(400)
        .json({ message: "Check-in time cannot be in the past." });
    }

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

    // Tìm tất cả phòng AVAILABLE với accommodationTypeId
    const availableRooms = await Accommodation.find({
      status: 1,
      accommodationTypeId: accommodationTypeId,
    });

    // Tìm danh sách phòng đã bị đặt trong khoảng thời gian đó
    const bookedRoomIds = await Booking.find({
      accommodationId: { $in: availableRooms.map((room) => room._id) },
      checkInHour: { $lt: vietnamTime2 },
      checkOutHour: { $gt: vietnamTime1 },
    }).distinct("accommodationId");

    console.log(bookedRoomIds);

    // Lọc ra những phòng chưa bị đặt trùng thời gian
    const bookedRoomIdStrings = bookedRoomIds.map((id) => id.toString());

    const suitableRooms = availableRooms.filter(
      (room) => !bookedRoomIdStrings.includes(room._id.toString())
    );

    console.log(suitableRooms);

    // Lấy phòng đầu tiên phù hợp
    const room = suitableRooms.length > 0 ? suitableRooms[0] : null;

    if (!room) {
      return res
        .status(400)
        .json({ message: "No available room for the selected time." });
    }

    const newBooking = new Booking({
      policySystemIds: policySystemIds,
      customerId,
      accommodationId: room._id,
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
      totalPrice,
      passwordRoom,
      note,
      timeExpireRefund,
      status,
    });

    await newBooking.save();

    // Nếu là trạng thái chờ thanh toán => set timeout huỷ sau 15 phút
    if (newBooking.paymentStatus === 2) {
      setTimeout(async () => {
        const latestBooking = await Booking.findById(newBooking._id);
        if (latestBooking && latestBooking.paymentStatus !== 3) {
          latestBooking.status = 6; 
          await latestBooking.save();
          console.log(
            `[AUTO CANCEL] Booking ${latestBooking._id} canceled due to timeout`
          );
        }
      }, 15 * 60 * 1000); // 15 phút
    }

    res.status(201).json({
      message: "Booking created successfully",
      booking: newBooking,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getOccupiedTimeSlots = asyncHandler(async (req, res) => {
  try {
    // Lấy tất cả phòng đang hoạt động
    const accommodations = await Accommodation.find({ status: 1 });

    // Lấy danh sách ID các phòng
    const accommodationIds = accommodations.map((room) => room._id.toString());

    console.log(accommodationIds);

    // Tìm tất cả các booking tương ứng (chưa bị xóa)
    const bookings = await Booking.find({
      accommodationId: { $in: accommodationIds },
    }).select("accommodationId checkInHour checkOutHour");

    console.log(
      "Booking query:",
      await Booking.find({
        accommodationId: { $in: accommodationIds },
        isDelete: false,
      })
    );

    // Nhóm kết quả theo phòng
    const result = {};
    bookings.forEach((booking) => {
      const roomId = booking.accommodationId.toString();
      if (!result[roomId]) result[roomId] = [];

      result[roomId].push({
        checkInHour: moment(booking.checkInHour)
          .tz("Asia/Ho_Chi_Minh")
          .format("DD-MM-YYYY HH:mm:ss"),
        checkOutHour: moment(booking.checkOutHour)
          .tz("Asia/Ho_Chi_Minh")
          .format("DD-MM-YYYY HH:mm:ss"),
      });
    });
    console.log(result);

    res.status(200).json({
      message: "Occupied time slots fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching time slots:", error);
    res.status(500).json({ message: "Server error" });
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
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const updateData = { ...req.body };

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
      return res.status(404).json({ message: "Booking not found" });
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
  const { id } = req.params;

  try {
    const deletedBooking = await softDelete(Booking, id);

    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Booking deleted successfully", data: deletedBooking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const processMoMoPayment = async (req, res) => {
  try {
    const { bookingId, amount, description, returnUrlFE, orderIdFE } = req.body;
    if (!bookingId || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const partnerCode = process.env.MOMO_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;
    const requestId = partnerCode + new Date().getTime();
    const orderId = orderIdFE;
    const orderInfo = description || "Payment for booking";
    const returnUrl = returnUrlFE;
    const notifyUrl = process.env.MOMO_NOTIFY_URL;
    const extraData = "";
    const requestType = "captureWallet";
    const requestTime = new Date().getTime();
    const expire = requestTime + 10 * 60 * 1000; // Thời gian hết hạn là 30 phút

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
      requestTime,
      expire,
    };

    console.log("MoMo Request:", momoRequest);

    const momoResponse = await axios.post(
      "https://test-payment.momo.vn/v2/gateway/api/create",
      momoRequest
    );

    console.log("MoMo Response:", momoResponse.data);

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

      return res.json({
        payUrl: momoResponse.data.payUrl,
        deeplink: momoResponse.data.deeplink,
        qrCodeUrl: momoResponse.data.qrCodeUrl,
      });
    } else {
      return res.status(500).json({ message: "Failed to initiate payment" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const processMomoCallback = async (req, res) => {
  console.log("Callback:");
  console.log(req.body);

  return res.status(200).json(req.body);
};

const ENUM_TO_LENGTH = [0, 2, 4, 6, 8];

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
    const transaction = await Transaction.findOne({ paymentCode: orderId });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Tìm booking liên quan
    const booking = await Booking.findById(transaction.bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Kiểm tra trạng thái thanh toán từ MoMo
    if (resultCode === 0) {
      transaction.transactionStatus = 2; // Đánh dấu đã thanh toán
      transaction.transactionEndDate = new Date(responseTime);
      booking.paymentStatus = 3;

      // Lấy accommodationType từ accommodation
      const accommodation = await Accommodation.findById(
        booking.accommodationId
      );
      if (accommodation && accommodation.accommodationTypeId) {
        const accommodationType = await AccommodationType.findById(
          accommodation.accommodationTypeId
        );

        if (accommodationType) {
          const passwordLength =
            ENUM_TO_LENGTH[accommodationType.numberOfPasswordRoom] || 4;

          // Chuyển đổi checkInHour và checkOutHour sang Asia/Ho_Chi_Minh
          const checkIn = moment
            .utc(booking.checkInHour)
            .tz("Asia/Ho_Chi_Minh");
          const checkOut = moment
            .utc(booking.checkOutHour)
            .tz("Asia/Ho_Chi_Minh");

          const now = moment().tz("Asia/Ho_Chi_Minh");
          const timeUntilCheckIn = checkIn.diff(now);
          const expireTime = checkIn
            .clone()
            .add(booking.durationBookingHour, "hours");
          const timeUntilExpire = expireTime.diff(now);

          // Lên lịch tạo password tại thời điểm check-in
          if (timeUntilCheckIn > 0) {
            setTimeout(async () => {
              const password = Array.from({ length: passwordLength }, () =>
                Math.floor(Math.random() * 10)
              ).join("");
              await Booking.findByIdAndUpdate(booking._id, {
                passwordRoom: password,
              });
              console.log(
                `[AUTO] Password set for booking ${booking._id}: ${password}`
              );
            }, timeUntilCheckIn);
          }

          // Lên lịch xoá password sau khi hết hạn
          if (timeUntilExpire > 0) {
            setTimeout(async () => {
              await Booking.findByIdAndUpdate(booking._id, {
                $unset: { passwordRoom: "" },
              });
              console.log(`[AUTO] Password removed for booking ${booking._id}`);
            }, timeUntilExpire);
          }
        }
      }
    } else {
      transaction.transactionStatus = 3; // Thanh toán thất bại
      booking.paymentStatus = 5;
    }

    await booking.save();
    await transaction.save();

    return res.json({ message: "Notification processed successfully" });
  } catch (error) {
    console.error("MoMo Notify Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Danh sách collection hợp lệ
const validCollections = ["Booking", "Transaction", "User"];

/**
 * API thực thi truy vấn động cho find() và aggregate()
 */
const query = asyncHandler(async (req, res) => {
  try {
    const { collection, query, projection, pipeline } = req.body;

    // Kiểm tra collection hợp lệ
    if (!validCollections.includes(collection)) {
      return res.status(400).json({ message: "Invalid collection" });
    }

    const Model = mongoose.model(collection);
    let result;

    if (pipeline) {
      // Chặn các toán tử nguy hiểm trong aggregation
      const forbiddenStages = ["$out", "$merge"];
      if (
        pipeline.some((stage) =>
          Object.keys(stage).some((key) => forbiddenStages.includes(key))
        )
      ) {
        return res
          .status(400)
          .json({ message: "Forbidden aggregation stage detected" });
      }

      result = await Model.aggregate(pipeline);
    } else if (query) {
      result = await Model.find(query, projection).lean();
    } else {
      return res
        .status(400)
        .json({ message: "Either 'query' or 'pipeline' must be provided" });
    }

    res.json({ data: result });
  } catch (error) {
    console.error("Query Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

const getBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const get1Booking = await Booking.findOne({ _id: id, isDelete: false })
      .populate({
        path: "accommodationId",
        populate: [
          { path: "accommodationTypeId" },
          { path: "rentalLocationId" },
        ],
      })
      .populate("policySystemIds")
      .populate({
        path: "customerId",
        populate: { path: "userId", select: "fullName" },
      })
      .populate("policySystemIds");
    res.json(get1Booking);
  } catch (error) {
    throw new Error(error);
  }
});

// API để tạo passwordRoom bất cứ khi nào cần
const generateRoomPassword = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { passwordRoomInput } = req.body;
    const booking = await Booking.findById(bookingId);

    console.log(passwordRoomInput);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Lấy thời gian hiện tại theo múi giờ Asia/Ho_Chi_Minh
    const now = moment().tz("Asia/Ho_Chi_Minh");

    // Chuyển đổi checkInHour và checkOutHour sang Asia/Ho_Chi_Minh
    const checkIn = moment.utc(booking.checkInHour).tz("Asia/Ho_Chi_Minh");
    const checkOut = moment.utc(booking.checkOutHour).tz("Asia/Ho_Chi_Minh");

    // Ghi nhật ký để kiểm tra giá trị thực tế
    console.log("Now:", now.format());
    console.log("Check-in:", checkIn.format());
    console.log("Check-out:", checkOut.format());

    // Kiểm tra tính hợp lệ của checkIn và checkOut
    if (!checkIn.isValid() || !checkOut.isValid()) {
      return res
        .status(400)
        .json({ message: "Invalid check-in or check-out date" });
    }

    if (checkIn.isBefore(now) || checkOut.isSameOrBefore(checkIn)) {
      return res.status(400).json({
        message:
          "Invalid booking dates: check-in must be in the future and check-out must be after check-in",
      });
    }

    booking.passwordRoom = passwordRoomInput;
    await booking.save();

    // Xóa passwordRoom sau khi hết thời gian checkOut
    const timeUntilCheckOut = checkOut.diff(now);
    if (timeUntilCheckOut > 0) {
      setTimeout(async () => {
        await Booking.findByIdAndUpdate(bookingId, {
          $unset: { passwordRoom: "" },
        });
      }, timeUntilCheckOut);
    }

    res.json({ message: "Password generated successfully", passwordRoomInput });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookingsByCustomerId = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  validateMongoDbId(customerId);
  try {
    const bookings = await Booking.find({
      customerId,
      isDelete: false,
    })
      .populate({
        path: "customerId",
        populate: { path: "userId", select: "fullName" },
      })
      .populate("policySystemIds")
      .populate({
        path: "accommodationId",
        populate: [
          {
            path: "rentalLocationId",
            select: "name address openHour closeHour ward district city",
          },
          {
            path: "accommodationTypeId",
            select: "name maxPeopleNumber basePrice overtimeHourlyPrice",
          },
        ],
      });
    if (bookings.length === 0) {
      return res
        .status(404)
        .json({ message: "No bookings found for this customer" });
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
  const { rentalLocationId } = req.params;

  try {
    // 1. Tìm tất cả accommodation theo rentalLocationId
    const accommodations = await Accommodation.find({
      rentalLocationId,
    }).select("_id");
    const accommodationIds = accommodations.map((a) => a._id);

    if (accommodationIds.length === 0) {
      return res
        .status(404)
        .json({ message: "No accommodations found for this rental location." });
    }

    // 2. Lấy tất cả booking liên quan
    const bookings = await Booking.find({
      accommodationId: { $in: accommodationIds },
    })
      .populate("accommodationId")
      .populate({
        path: "customerId",
        populate: { path: "userId", select: "fullName" },
      })
      .populate("policySystemIds");

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
      .json({ message: "Failed to get bookings", error: error.message });
  }
});

const getAllBooking = asyncHandler(async (req, res) => {
  try {
    const getAllBooking = await Booking.find({ isDelete: false })
      .populate({
        path: "accommodationId",
        populate: [
          {
            path: "rentalLocationId",
            select: "name address openHour closeHour ward district city",
          },
          {
            path: "accommodationTypeId",
            select: "name maxPeopleNumber basePrice overtimeHourlyPrice",
          },
        ],
      })
      .populate({
        path: "policySystemIds",
        populate: [
          {
            path: "adminId",
            // select: "name address openHour closeHour ward district city",
            populate: {
              path: "userId",
              select: "fullName",
            },
          },
          {
            path: "policySystemCategoryId",
            // select: "name maxPeopleNumber basePrice overtimeHourlyPrice",
          },
        ],
      })

      .populate({
        path: "customerId",
        populate: { path: "userId", select: "fullName" },
      });

    // const formattedBookings = await Promise.all(
    //   getAllBooking.map(async (doc) => {
    //     const docObj = doc.toJSON();

    //     const policySystemIds = await PolicySystem.find({
    //       bookingId: doc._id,
    //       isDelete: false,
    //     }).select("_id name description status");

    //     docObj.policySystemIds = policySystemIds;

    //     return docObj;
    //   })
    // );

    res.status(200).json({
      success: true,
      data: getAllBooking,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getBookingsByOwner = asyncHandler(async (req, res) => {
  const { ownerId } = req.params;

  try {
    // 1. Find all rental locations owned by this owner
    const rentalLocations = await RentalLocation.find({ ownerId }).select(
      "_id"
    );
    const rentalLocationIds = rentalLocations.map((loc) => loc._id);

    if (rentalLocationIds.length === 0) {
      return res
        .status(404)
        .json({ message: "No rental locations found for this owner." });
    }

    // 2. Find all accommodations belonging to these rental locations
    const accommodations = await Accommodation.find({
      rentalLocationId: { $in: rentalLocationIds },
    }).select("_id");
    const accommodationIds = accommodations.map((a) => a._id);

    if (accommodationIds.length === 0) {
      return res.status(404).json({
        message: "No accommodations found for this owner's rental locations.",
      });
    }

    // 3. Get all bookings related to these accommodations
    const bookings = await Booking.find({
      accommodationId: { $in: accommodationIds },
    })
      .populate({
        path: "accommodationId",
        populate: [
          {
            path: "rentalLocationId",
            select: "name address openHour closeHour ward district city",
          },
          {
            path: "accommodationTypeId",
            select: "name maxPeopleNumber basePrice overtimeHourlyPrice",
          },
        ],
      })
      .populate({
        path: "customerId",
        populate: { path: "userId", select: "fullName" },
      })
      .populate("policySystemIds");

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
      .json({ message: "Failed to get bookings", error: error.message });
  }
});

const checkRoomAvailability = asyncHandler(async (req, res) => {
  try {
    const { accommodationTypeId, checkIn, checkOut } = req.body;

    if (!accommodationTypeId || !checkIn || !checkOut) {
      return res.status(400).json({
        message: "accommodationTypeId, checkIn, and checkOut are required",
      });
    }

    const requestedCheckIn = moment
      .tz(checkIn, "DD-MM-YYYY HH:mm:ss", "Asia/Ho_Chi_Minh")
      .toDate();
    const requestedCheckOut = moment
      .tz(checkOut, "DD-MM-YYYY HH:mm:ss", "Asia/Ho_Chi_Minh")
      .toDate();

    if (requestedCheckOut <= requestedCheckIn) {
      return res
        .status(400)
        .json({ message: "Check-out time must be after check-in time" });
    }

    const accommodations = await Accommodation.find({
      accommodationTypeId: accommodationTypeId,
      status: 1,
    });

    if (!accommodations || accommodations.length === 0) {
      return res
        .status(404)
        .json({ message: "No active rooms found for this accommodation type" });
    }

    const accommodationIds = accommodations.map((room) => room._id.toString());

    const bookings = await Booking.find({
      accommodationId: { $in: accommodationIds },
      isDelete: false,
      $or: [
        {
          checkInHour: { $lt: requestedCheckOut },
          checkOutHour: { $gt: requestedCheckIn },
        },
      ],
    }).select("accommodationId checkInHour checkOutHour");

    const occupiedRoomIds = new Set(
      bookings.map((booking) => booking.accommodationId.toString())
    );

    const availableRooms = accommodations
      .filter((room) => !occupiedRoomIds.has(room._id.toString()))
      .map((room) => ({
        roomId: room._id.toString(),
        name: room.name || `AccommodationId ${room._id}`,
      }));

    const isAvailable = availableRooms.length > 0;

    res.status(200).json({
      isAvailable: isAvailable, // Add the boolean field
      message: isAvailable
        ? "Accommodations are available for the selected time slot"
        : "No Accommodations are available for the selected time slot",
      data: availableRooms,
    });
  } catch (error) {
    console.error("Error checking room availability:", error);
    res.status(500).json({ message: "Server error" });
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
  getOccupiedTimeSlots,
  processMoMoPayment,
  processMoMoNotify,
  processMomoCallback,
  generateRoomPassword,
  query,
  checkRoomAvailability,
};
