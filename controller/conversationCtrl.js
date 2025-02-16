const Conversation = require("../models/conversationModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");
const softDelete = require("../utils/softDelete");
const Booking = require("../models/bookingModel");

const createConversation = asyncHandler(async (req, res) => {
    try {
        const newConversation = await Conversation.create(req.body);
        res.json(newConversation);
    } catch (error) {
        throw new Error(error);
    }
});
const updateConversation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const updatedConversation = await Conversation.findByIdAndUpdate(
            id,
            {
                ...req.body,
                lastMessageDate: moment().tz("Asia/Ho_Chi_Minh").toDate(), // Update to current VN time
            },
            { new: true }
        );

        if (!updatedConversation) {
            return res.status(404).json({ success: false, message: "Conversation not found" });
        }

        res.status(200).json({
            success: true,
            data: updatedConversation,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

const deleteConversation = asyncHandler(async (req, res) => {
    const {id} = req.params;

    try {
        const deletedConversation = await softDelete(Conversation, id);

        if (!deletedConversation) {
            return res.status(404).json({message: "Conversation not found"});
        }
        res.json({message: "Conversation deleted successfully", data: deletedConversation});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

const getConversation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const getConversation = await Conversation.findOne({_id: id, isDelete: false});
        res.json(getConversation);
    } catch (error) {
        throw new Error(error);
    }
});

const getAllConversation = asyncHandler(async (req, res) => {
    try {
        const conversations = await Conversation.find({isDelete: false});
        const formattedConversations = conversations.map(doc => doc.toJSON());
        res.status(200).json({
            success: true,
            data: formattedConversations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
});

module.exports = {
    createConversation,
    updateConversation,
    deleteConversation,
    getConversation,
    getAllConversation,
};