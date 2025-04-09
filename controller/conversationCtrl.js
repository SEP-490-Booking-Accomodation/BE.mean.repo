const Conversation = require("../models/conversationModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const moment = require("moment-timezone");
const softDelete = require("../utils/softDelete");
const Booking = require("../models/bookingModel");

// Create a conversation between two users
const createConversation = asyncHandler(async (req, res) => {
    try {
        const { participants } = req.body;

        // Validate that we have exactly 2 participants
        if (!participants || !Array.isArray(participants) || participants.length !== 2) {
            return res.status(400).json({
                success: false,
                message: "Conversation must have exactly 2 participants"
            });
        }

        // Check if a conversation between these users already exists
        const existingConversation = await Conversation.findOne({
            participants: { $all: participants },
            isDelete: false
        });

        if (existingConversation) {
            return res.status(200).json({
                success: true,
                message: "Conversation already exists",
                data: existingConversation
            });
        }

        // Create new conversation
        const newConversation = await Conversation.create(req.body);
        res.status(201).json({
            success: true,
            message: "Conversation created successfully",
            data: newConversation
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

const updateConversation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
        const updatedConversation = await Conversation.findByIdAndUpdate(
            id,
            {
                ...req.body
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
        const getConversation = await Conversation.findOne({_id: id, isDelete: false})
            .populate('participants', 'fullName avatarUrl'); // Add fields you want to populate

        if (!getConversation) {
            return res.status(404).json({ success: false, message: "Conversation not found" });
        }

        res.json({
            success: true,
            data: getConversation
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

const getAllConversation = asyncHandler(async (req, res) => {
    try {
        const conversations = await Conversation.find({isDelete: false})
            .populate('participants', 'fullName avatarUrl'); // Add fields you want to populate

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

// Get all conversations for a specific user
const getUserConversations = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    validateMongoDbId(userId);

    try {
        const conversations = await Conversation.find({
            participants: userId,
            isDelete: false
        }).populate('participants', 'fullName avatarUrl'); // Add fields you want to populate

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

// Get conversation between two specific users
const getConversationBetweenUsers = asyncHandler(async (req, res) => {
    const { userId1, userId2 } = req.params;
    validateMongoDbId(userId1);
    validateMongoDbId(userId2);

    try {
        const conversation = await Conversation.findOne({
            participants: { $all: [userId1, userId2] },
            isDelete: false
        }).populate('participants', 'fullName avatarUrl'); // Add fields you want to populate

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "No conversation found between these users"
            });
        }

        res.status(200).json({
            success: true,
            data: conversation
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
    getUserConversations,
    getConversationBetweenUsers,
};