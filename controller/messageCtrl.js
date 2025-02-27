const Message = require("../models/messageModel");
const Conversation = require("../models/conversationModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");
const softDelete = require("../utils/softDelete");

const createMessage = asyncHandler(async (req, res) => {
    const { conversationId, content } = req.body;
  
    if (!conversationId || !content) {
      return res.status(400).json({ success: false, message: "Conversation ID and content are required" });
    }
  
    try {
      // Create the new message
      const newMessage = await Message.create({
        conversationId,
        content,
      });
  
      // Update the `lastMessage` and `lastMessageDate` in the associated conversation
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: content,
        lastMessageDate: moment().tz("Asia/Ho_Chi_Minh").toDate(),
      });
  
      res.status(201).json({
        success: true,
        data: newMessage,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
const updateMessage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const updateMessage = await Message.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.json(updateMessage);
    } catch (error) {
      throw new Error(error);
    }
});
  
const deleteMessage = asyncHandler(async (req, res) => {
  const {id} = req.params;
  try {
    const deletedMessage= await softDelete(Message, id);
    if (!deletedMessage) {
      return res.status(404).json({message: "Message not found"});
    }
    res.json({message: "Message deleted successfully", data: deletedMessage});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
});
  
const getMessage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const getMessages = await Message.findOne({_id: id, isDelete: false});
      res.json(getMessages);
    } catch (error) {
      throw new Error(error);
    }
});

const getAllMessage = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({isDelete: false});
    const formattedMessages = messages.map(doc => doc.toJSON());
    res.status(200).json({
      success: true,
      data: formattedMessages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
});

const getMessagesByConversation = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
  
    try {
      const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
  
      if (!messages.length) {
        return res.status(404).json({
          success: false,
          message: "No messages found for this conversation",
        });
      }
  
      res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

module.exports = {
    createMessage,
    updateMessage,
    deleteMessage,
    getMessage,
    getAllMessage,
    getMessagesByConversation,
};