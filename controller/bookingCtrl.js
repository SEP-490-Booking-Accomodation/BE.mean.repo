const Booking = require("../models/bookingModel");
const Transaction = require("../models/transactionModel");
const { RentalLocation } = require("../models/rentalLocationModel");
const PolicySystem = require("../models/policySystemModel");
const PolicyOwner = require("../models/policyOwnerModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const softDelete = require("../utils/softDelete");
const Accommodation = require("../models/accommodationModel");
const User = require("../models/userModel");
const AccommodationType = require("../models/accommodationTypeModel");
const { Owner } = require("../models/ownerModel");
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
      rentalLocationId,
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
      ? moment
          .tz(checkInHour, "DD-MM-YYYY HH:mm:ss", "Asia/Ho_Chi_Minh")
          .toDate()
      : null;

    if (vietnamTime1 && moment(vietnamTime1).isBefore(vietnamTimeNow)) {
      return res
        .status(400)
        .json({ message: "Check-in time cannot be in the past." });
    }

    const vietnamTime2 = checkOutHour
      ? moment
          .tz(checkOutHour, "DD-MM-YYYY HH:mm:ss", "Asia/Ho_Chi_Minh")
          .toDate()
      : null;
    const vietnamTime3 = confirmDate
      ? moment
          .tz(confirmDate, "DD-MM-YYYY HH:mm:ss", "Asia/Ho_Chi_Minh")
          .toDate()
      : null;
    const vietnamTime4 = completedDate
      ? moment
          .tz(completedDate, "DD-MM-YYYY HH:mm:ss", "Asia/Ho_Chi_Minh")
          .toDate()
      : null;
    const vietnamTime5 = timeExpireRefund
      ? moment
          .tz(timeExpireRefund, "DD-MM-YYYY HH:mm:ss", "Asia/Ho_Chi_Minh")
          .toDate()
      : null;

    // Tìm tất cả phòng AVAILABLE với accommodationTypeId
    const availableRooms = await Accommodation.find({
      status: 1,
      accommodationTypeId: accommodationTypeId,
      rentalLocationId: rentalLocationId,
    });

    // Lấy ownerId từ accommodationTypeId
    const accommodationType = await AccommodationType.findById(
      accommodationTypeId
    ).lean();

    // Truy vấn policy nguời dùng để lấy thời gian timeout thanh toán
    if (!accommodationType || !accommodationType.ownerId) {
      return res
        .status(400)
        .json({ message: "Accommodation type or owner not found." });
    }

    // Lấy danh sách policyOwner theo ownerId
    const policyOwners = await PolicyOwner.find({
      ownerId: accommodationType.ownerId,
      isDelete: false,
      status: 1,
    })
      .populate("values")
      .lean();

    console.log("policyOwners:", policyOwners);

    let prepareMinutes = 0;
    let foundP = false;

    for (const policy of policyOwners) {
      if (Array.isArray(policy.values)) {
        const timeValue = policy.values.find(
          (v) => v.hashTag === "pretime" && !v.isDelete
        );

        if (timeValue && !isNaN(parseInt(timeValue.val))) {
          prepareMinutes = parseInt(timeValue.val);
          console.log("Found prepare minutes:", prepareMinutes);
          foundP = true;
          break;
        }
      }
    }
    if (!foundP) {
      console.log("Không tìm thấy hashtag #pretime, dùng mặc định 0 phút");
    }

    // Lấy tất cả bookings nằm trong khoảng có khả năng bị trùng
    const allBookings = await Booking.find({
      accommodationId: { $in: availableRooms.map((room) => room._id) },
      checkInHour: { $lt: vietnamTime2 }, // vẫn giữ điều kiện lọc sơ bộ
      checkOutHour: { $ne: null },
    });

    // Lọc các bookings có trùng sau khi cộng thời gian chuẩn bị
    const bookedRoomIds = allBookings
      .filter((b) => {
        const checkoutWithPrep = moment(b.checkOutHour).add(
          prepareMinutes,
          "minutes"
        );
        return (
          moment(vietnamTime1).isBefore(checkoutWithPrep) &&
          moment(vietnamTime2).isAfter(moment(b.checkInHour))
        );
      })
      .map((b) => b.accommodationId.toString());

    console.log(bookedRoomIds);

    const suitableRooms = availableRooms.filter(
      (room) => !bookedRoomIds.includes(room._id.toString())
    );

    // console.log(suitableRooms);

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
      timeExpireRefund: vietnamTime5,
      status,
    });

    await newBooking.save();

    // Truy vấn policy hệ thống để lấy thời gian timeout thanh toán
    const expirePolicies = await PolicySystem.find({
      isDelete: false,
    })
      .populate("values")
      .lean()
      .exec();

    console.log("expirePolicies:", expirePolicies);

    let expireMinutes = 15;
    let found = false;

    for (const policy of expirePolicies) {
      if (Array.isArray(policy.values)) {
        const timeValue = policy.values.find(
          (v) => v.hashTag === "expiretimepayment" && !v.isDelete
        );

        if (timeValue && !isNaN(parseInt(timeValue.val))) {
          expireMinutes = parseInt(timeValue.val);
          console.log("Found expire time:", expireMinutes);
          found = true;
          break;
        }
      }
    }

    if (!found) {
      console.log(
        "Không tìm thấy hashtag #expiretimepayment, dùng mặc định 15 phút"
      );
    }

    // Nếu là trạng thái chờ thanh toán => set timeout huỷ sau 15 phút
    if (newBooking.paymentStatus === 2) {
      setTimeout(async () => {
        const latestBooking = await Booking.findById(newBooking._id);
        if (latestBooking && latestBooking.paymentStatus !== 3) {
          latestBooking.status = 6;
          latestBooking.paymentStatus = 5;
          latestBooking.note = "Cancel booking due to overdue payment!!!";
          await latestBooking.save();
          console.log(
            `[AUTO CANCEL] Booking ${latestBooking._id} canceled due to timeout`
          );
          //thêm đổi trạng thái thanh toán thành huỷ
        }
      }, expireMinutes * 60 * 1000); // 15 phút
      console.log("expireMinutes: ", expireMinutes);
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

const updateBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const updateData = { ...req.body };

    [
      "checkInHour",
      "checkOutHour",
      "confirmDate",
      "completedDate",
      "timeExpireRefund",
    ].forEach((field) => {
      if (updateData[field]) {
        updateData[field] = moment(updateData[field], "DD-MM-YYYY HH:mm:ss")
          .tz("Asia/Ho_Chi_Minh")
          .toDate();
      }
    });

    const updatedBooking = await Booking.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    console.log("Update status:", updateData.status);

    // Nếu status được cập nhật thành 3 (CHECKEDIN) thì tạo password ngay
    if (Number(updateData.status) === 3) {
      const accommodation = await Accommodation.findById(
        updatedBooking.accommodationId
      );

      console.log(accommodation);

      if (accommodation?.accommodationTypeId) {
        const accommodationType = await AccommodationType.findById(
          accommodation.accommodationTypeId
        );

        console.log("type:", accommodationType);

        if (accommodationType) {
          const passwordLength = accommodationType.numberOfPasswordRoom || 4;
          const password = Array.from({ length: passwordLength }, () =>
            Math.floor(Math.random() * 10)
          ).join("");

          console.log(
            "Number password:",
            accommodationType.numberOfPasswordRoom
          );
          console.log(passwordLength);

          await Booking.findByIdAndUpdate(updatedBooking._id, {
            passwordRoom: password,
          });

          console.log(
            `[AUTO] Password set immediately for booking ${updatedBooking._id}: ${password}`
          );

          // Lên lịch xoá mật khẩu khi hết thời gian đặt phòng
          const now = moment().tz("Asia/Ho_Chi_Minh");
          const expireTime = moment(updatedBooking.checkInHour)
            .tz("Asia/Ho_Chi_Minh")
            .add(updatedBooking.durationBookingHour, "hours");

          const timeUntilExpire = expireTime.diff(now);
          console.log(expireTime);

          if (timeUntilExpire > 0) {
            setTimeout(async () => {
              await Booking.findByIdAndUpdate(updatedBooking._id, {
                $unset: { passwordRoom: "" },
                $set: { status: 7 },
              });

              console.log(
                `[AUTO] Password removed for booking ${updatedBooking._id}`
              );
              console.log(
                `[AUTO] Status booking set to completed ${updatedBooking._id}`
              );
            }, timeUntilExpire);
          }
        }
      }
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

      // 🔄 Cập nhật các transaction cũ của cùng bookingId thành FAILED
      await Transaction.updateMany(
        {
          bookingId: transaction.bookingId,
          _id: { $ne: transaction._id }, // Loại trừ giao dịch hiện tại
        },
        { $set: { transactionStatus: 3 } } // FAILED
        //thêm đổi status thanh toán thành huỷ
      );

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
          {
            path: "rentalLocationId",
            populate: {
              path: "ownerId",
              populate: {
                path: "userId",
                select: "fullName email", // thêm field nếu cần
              },
            },
          },
        ],
      })
      .populate("policySystemIds")
      .populate({
        path: "customerId",
        populate: { path: "userId", select: "fullName" },
      })
      .populate("policySystemIds")
      .populate("couponId");
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

const getAllOwnerBookings = asyncHandler(async (req, res) => {
  try {
    // 1. Lấy tất cả rental locations và populate owner → user
    const rentalLocations = await RentalLocation.find()
      .populate({
        path: "ownerId",
        populate: {
          path: "userId",
          select: "fullName email",
        },
      })
      .lean();

    const ownerGroups = {};
    let totalBooking = 0; // ✅ Biến tổng

    for (const location of rentalLocations) {
      const owner = location.ownerId;
      if (!owner || !owner.userId) continue; // đảm bảo dữ liệu không bị thiếu

      const ownerId = owner._id.toString();
      const ownerName = owner.userId.fullName || "Unknown";

      if (!ownerGroups[ownerId]) {
        ownerGroups[ownerId] = {
          ownerId,
          ownerName,
          bookings: [],
        };
      }

      // 2. Lấy các accommodation thuộc rentalLocation này
      const accommodations = await Accommodation.find({
        rentalLocationId: location._id,
      }).select("_id");

      const accommodationIds = accommodations.map((a) => a._id);
      if (accommodationIds.length === 0) continue;

      // 3. Lấy tất cả bookings thuộc các accommodation
      const bookings = await Booking.find({
        accommodationId: { $in: accommodationIds },
      })
        .populate({
          path: "accommodationId",
          populate: [
            {
              path: "rentalLocationId",
              select: "name address",
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
        .populate("policySystemIds")
        .lean();

      // ✅ Cộng tổng số booking
      totalBooking += bookings.length;
      ownerGroups[ownerId].bookings.push(...bookings);
    }

    // 4. Sort theo tên owner
    const sortedResults = Object.values(ownerGroups).sort((a, b) =>
      a.ownerName.localeCompare(b.ownerName)
    );

    res.status(200).json({
      totalOwner: sortedResults.length,
      totalBooking,
      owners: sortedResults,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch grouped owner bookings",
      error: error.message,
    });
  }
});

const checkRoomAvailability = asyncHandler(async (req, res) => {
  try {
    const { accommodationTypeId, rentalLocationId, checkIn, checkOut } =
      req.body;

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
      rentalLocationId: rentalLocationId,
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

// Helper: get owner and accommodationIds
const getOwnerAccommodationIds = async (userId) => {
  const owner = await Owner.findOne({ userId, isDelete: false });
  if (!owner) throw new Error("Owner not found");

  const rentalLocations = await RentalLocation.find({ ownerId: owner._id });
  const locationIds = rentalLocations.map((loc) => loc._id);
  const accommodations = await Accommodation.find({
    rentalLocationId: { $in: locationIds },
  });
  const accommodationIds = accommodations.map((a) => a._id);

  return { owner, accommodationIds };
};

// 1. Weekly Booking Count
const getWeeklyBookingCountByOwner = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { week, year } = req.query;

  const today = moment().tz("Asia/Ho_Chi_Minh");
  const targetYear = parseInt(year) || today.year();
  const targetWeek = parseInt(week) || today.isoWeek();

  const startOfWeek = moment()
    .tz("Asia/Ho_Chi_Minh")
    .year(targetYear)
    .isoWeek(targetWeek)
    .startOf("isoWeek");
  const endOfWeek = startOfWeek.clone().endOf("isoWeek");

  const { accommodationIds } = await getOwnerAccommodationIds(userId);

  // Lấy thông tin owner (user)
  const owner = await User.findById(userId).select("fullName");
  if (!owner) {
    return res.status(404).json({ message: "Owner not found" });
  }

  const bookings = await Booking.find({
    accommodationId: { $in: accommodationIds },
    isDelete: false,
    createdAt: { $gte: startOfWeek.toDate(), $lte: endOfWeek.toDate() },
  });

  const weekdayMap = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const weekStats = Object.fromEntries(weekdayMap.map((day) => [day, 0]));

  bookings.forEach((booking) => {
    const index = moment(booking.createdAt).tz("Asia/Ho_Chi_Minh").isoWeekday();
    const key = weekdayMap[index - 1];
    weekStats[key]++;
  });

  res.json({
    userId,
    ownerId: owner._id,
    ownerFullName: owner.fullName,
    year: targetYear,
    week: targetWeek,
    totalBookingsInWeek: bookings.length,
    weeklyBookingCounts: weekStats,
  });
});

// 1.1 Weekly Booking Count no param
const getWeeklyBookingCountByOwnerNoParam = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const today = moment().tz("Asia/Ho_Chi_Minh");
  const currentWeek = today.isoWeek();
  const currentYear = today.year();
  const startOfWeek = today.clone().startOf("isoWeek");
  const endOfWeek = today.clone().endOf("isoWeek");

  const { owner, accommodationIds } = await getOwnerAccommodationIds(userId);

  const bookings = await Booking.find({
    accommodationId: { $in: accommodationIds },
    isDelete: false,
    createdAt: { $gte: startOfWeek.toDate(), $lte: endOfWeek.toDate() },
  });

  const weekdayMap = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const weekStats = Object.fromEntries(weekdayMap.map((day) => [day, 0]));

  bookings.forEach((booking) => {
    const index = moment(booking.createdAt).tz("Asia/Ho_Chi_Minh").isoWeekday();
    const key = weekdayMap[index - 1];
    weekStats[key]++;
  });

  res.json({
    userId,
    ownerId: owner._id,
    week: currentWeek,
    year: currentYear,
    weeklyBookingCounts: weekStats,
  });
});

// 2. Monthly Booking Count
const getMonthlyBookingCountByOwner = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { year, month } = req.query;

  const today = moment().tz("Asia/Ho_Chi_Minh");
  const targetYear = parseInt(year) || today.year();
  const targetMonth = parseInt(month) || today.month() + 1;
  const targetMonthPadded = String(targetMonth).padStart(2, "0");

  const startOfMonth = moment
    .tz(`${targetYear}-${targetMonthPadded}-01`, "Asia/Ho_Chi_Minh")
    .startOf("month");

  const endOfMonth = startOfMonth.clone().endOf("month");

  // Lấy owner info
  const owner = await User.findById(userId).select("fullName");
  if (!owner) {
    return res.status(404).json({ message: "Owner not found" });
  }

  const { accommodationIds } = await getOwnerAccommodationIds(userId);

  const bookings = await Booking.find({
    accommodationId: { $in: accommodationIds },
    isDelete: false,
    createdAt: { $gte: startOfMonth.toDate(), $lte: endOfMonth.toDate() },
  });

  const dailyBookingCounts = {};
  const daysInMonth = endOfMonth.date();
  for (let i = 1; i <= daysInMonth; i++) {
    dailyBookingCounts[`Ngày ${i}`] = 0;
  }

  bookings.forEach((booking) => {
    const day = moment(booking.createdAt).tz("Asia/Ho_Chi_Minh").date();
    dailyBookingCounts[`Ngày ${day}`]++;
  });

  res.json({
    userId,
    ownerId: owner._id,
    ownerFullName: owner.fullName,
    month: targetMonth,
    year: targetYear,
    totalBookingsInMonth: bookings.length,
    dailyBookingCounts,
  });
});

// 2.1 Monthly Booking Count no param
const getMonthlyBookingCountByOwnerNoParam = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const today = moment().tz("Asia/Ho_Chi_Minh");
  const currentYear = today.year();
  const currentMonth = today.month() + 1;
  const startOfMonth = today.clone().startOf("month");
  const endOfMonth = today.clone().endOf("month");

  const { owner, accommodationIds } = await getOwnerAccommodationIds(userId);

  const bookings = await Booking.find({
    accommodationId: { $in: accommodationIds },
    isDelete: false,
    createdAt: { $gte: startOfMonth.toDate(), $lte: endOfMonth.toDate() },
  });

  const dayCounts = {};
  const daysInMonth = endOfMonth.date();
  for (let i = 1; i <= daysInMonth; i++) {
    dayCounts[`Ngày ${i}`] = 0;
  }

  bookings.forEach((booking) => {
    const day = moment(booking.createdAt).tz("Asia/Ho_Chi_Minh").date();
    dayCounts[`Ngày ${day}`]++;
  });

  res.json({
    userId,
    ownerId: owner._id,
    month: currentMonth,
    year: currentYear,
    dailyBookingCounts: dayCounts,
  });
});

// 3. Weekly Revenue
const getWeeklyRevenueByOwner = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { week, year } = req.query;

  const today = moment().tz("Asia/Ho_Chi_Minh");
  const targetYear = parseInt(year) || today.year();
  const targetWeek = parseInt(week) || today.isoWeek();

  const startOfWeek = moment()
    .tz("Asia/Ho_Chi_Minh")
    .year(targetYear)
    .isoWeek(targetWeek)
    .startOf("isoWeek");
  const endOfWeek = startOfWeek.clone().endOf("isoWeek");

  // Lấy owner info
  const owner = await User.findById(userId).select("fullName");
  if (!owner) {
    return res.status(404).json({ message: "Owner not found" });
  }

  const { accommodationIds } = await getOwnerAccommodationIds(userId);

  const bookings = await Booking.find({
    accommodationId: { $in: accommodationIds },
    paymentStatus: 3,
    status: 7,
    isDelete: false,
    createdAt: { $gte: startOfWeek.toDate(), $lte: endOfWeek.toDate() },
  });

  const weekdayMap = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const weekRevenue = Object.fromEntries(weekdayMap.map((day) => [day, 0]));

  let totalRevenue = 0;

  bookings.forEach((booking) => {
    const index = moment(booking.createdAt).tz("Asia/Ho_Chi_Minh").isoWeekday();
    const key = weekdayMap[index - 1];
    const revenue = booking.totalPrice || 0;
    weekRevenue[key] += revenue;
    totalRevenue += revenue;
  });

  res.json({
    userId,
    ownerId: owner._id,
    ownerFullName: owner.fullName,
    year: targetYear,
    week: targetWeek,
    totalRevenueInWeek: totalRevenue,
    weeklyRevenue: weekRevenue,
  });
});

// 3.1 Weekly Revenue no param
const getWeeklyRevenueByOwnerNoParam = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const today = moment().tz("Asia/Ho_Chi_Minh");
  const currentWeek = today.isoWeek();
  const currentYear = today.year();
  const startOfWeek = today.clone().startOf("isoWeek");
  const endOfWeek = today.clone().endOf("isoWeek");

  const { owner, accommodationIds } = await getOwnerAccommodationIds(userId);

  const bookings = await Booking.find({
    accommodationId: { $in: accommodationIds },
    paymentStatus: 3,
    isDelete: false,
    createdAt: { $gte: startOfWeek.toDate(), $lte: endOfWeek.toDate() },
  });

  const weekRevenue = { T2: 0, T3: 0, T4: 0, T5: 0, T6: 0, T7: 0, CN: 0 };
  bookings.forEach((booking) => {
    const day = moment(booking.createdAt).tz("Asia/Ho_Chi_Minh").isoWeekday();
    const key = day === 7 ? "CN" : `T${day}`;
    weekRevenue[key] += booking.totalPrice;
  });

  res.json({
    userId,
    ownerId: owner._id,
    week: currentWeek,
    year: currentYear,
    weeklyRevenue: weekRevenue,
  });
});

// 4. Monthly Revenue
const getMonthlyRevenueByOwner = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { year, month } = req.query;

  // Lấy thời điểm hiện tại theo múi giờ Việt Nam
  const today = moment().tz("Asia/Ho_Chi_Minh");

  // Năm và tháng mục tiêu
  const targetYear = parseInt(year) || today.year();
  const targetMonth = parseInt(month) || today.month() + 1; // month() trả về 0-11 nên +1
  const targetMonthPadded = String(targetMonth).padStart(2, "0");

  // Tính ngày bắt đầu và kết thúc tháng
  const startOfMonth = moment
    .tz(`${targetYear}-${targetMonthPadded}-01`, "Asia/Ho_Chi_Minh")
    .startOf("month");

  const endOfMonth = startOfMonth.clone().endOf("month");

  // Lấy thông tin chủ sở hữu
  const owner = await User.findById(userId).select("fullName");
  if (!owner) {
    return res.status(404).json({ message: "Owner not found" });
  }

  // Lấy danh sách accommodation thuộc owner
  const { accommodationIds } = await getOwnerAccommodationIds(userId);

  // Tìm các booking đã thanh toán trong tháng
  const bookings = await Booking.find({
    accommodationId: { $in: accommodationIds },
    paymentStatus: 3,
    status: 7,
    isDelete: false,
    createdAt: { $gte: startOfMonth.toDate(), $lte: endOfMonth.toDate() },
  });

  // Tính doanh thu theo từng ngày
  const daysInMonth = endOfMonth.date();
  const dailyRevenue = {};
  let totalRevenueInMonth = 0;

  for (let i = 1; i <= daysInMonth; i++) {
    dailyRevenue[`Ngày ${i}`] = 0;
  }

  bookings.forEach((booking) => {
    const day = moment(booking.createdAt).tz("Asia/Ho_Chi_Minh").date();
    const revenue = booking.totalPrice || 0;
    dailyRevenue[`Ngày ${day}`] += revenue;
    totalRevenueInMonth += revenue;
  });

  res.json({
    userId,
    ownerId: owner._id,
    ownerFullName: owner.fullName,
    month: targetMonth,
    year: targetYear,
    totalRevenueInMonth,
    dailyRevenue,
  });
});

// 4.1 Monthyl Revenue no param
const getMonthlyRevenueByOwnerNoParam = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const today = moment().tz("Asia/Ho_Chi_Minh");
  const currentYear = today.year();
  const currentMonth = today.month() + 1;
  const startOfMonth = today.clone().startOf("month");
  const endOfMonth = today.clone().endOf("month");

  const { owner, accommodationIds } = await getOwnerAccommodationIds(userId);

  const bookings = await Booking.find({
    accommodationId: { $in: accommodationIds },
    paymentStatus: 3,
    isDelete: false,
    createdAt: { $gte: startOfMonth.toDate(), $lte: endOfMonth.toDate() },
  });

  const dailyRevenue = {};
  const daysInMonth = endOfMonth.date();
  for (let i = 1; i <= daysInMonth; i++) {
    dailyRevenue[`Ngày ${i}`] = 0;
  }

  bookings.forEach((booking) => {
    const day = moment(booking.createdAt).tz("Asia/Ho_Chi_Minh").date();
    dailyRevenue[`Ngày ${day}`] += booking.totalPrice;
  });

  res.json({
    userId,
    ownerId: owner._id,
    month: currentMonth,
    year: currentYear,
    dailyRevenue: dailyRevenue,
  });
});

module.exports = {
  createBooking,
  updateBooking,
  deleteBooking,
  getBooking,
  getBookingsByCustomerId,
  getBookingsByOwner,
  getAllOwnerBookings,
  getBookingsByRentalLocation,
  getAllBooking,
  getOccupiedTimeSlots,
  processMoMoPayment,
  processMoMoNotify,
  processMomoCallback,
  generateRoomPassword,
  query,
  checkRoomAvailability,
  getWeeklyBookingCountByOwner,
  getMonthlyBookingCountByOwner,
  getWeeklyRevenueByOwner,
  getMonthlyRevenueByOwner,
  getWeeklyBookingCountByOwnerNoParam,
  getMonthlyBookingCountByOwnerNoParam,
  getWeeklyRevenueByOwnerNoParam,
  getMonthlyRevenueByOwnerNoParam,
};
