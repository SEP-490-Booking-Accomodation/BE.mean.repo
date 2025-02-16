const Notification = require("../models/notificationModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");

const createNotification = asyncHandler(async (req, res) => {
  try {
    const newNotification = await Notification.create(req.body);
    res.json(newNotification);
  } catch (error) {
    throw new Error(error);
  }
});
const updateNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateNotification = await Notification.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateNotification);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deletedNotification = await softDelete(Notification, id);
    if (!deletedNotification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ message: "Notification deleted successfully", data: deletedNotification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getNotification = await Notification.findOne({_id: id, isDelete: false});
    res.json(getNotification);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllNotification = asyncHandler(async (req, res) => {
  try {
    const notifications = await Notification.find({isDelete: false});
    const formattedNotifications = notifications.map(doc => doc.toJSON());
    res.status(200).json({
      success: true,
      data: formattedNotifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
});

const getUserNotifications = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

    if (!notifications.length) {
      return res.status(404).json({
        success: false,
        message: "No notifications found",
      });
    }

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = {
  createNotification,
  updateNotification,
  deleteNotification,
  getNotification,
  getAllNotification,
  getUserNotifications
};