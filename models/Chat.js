const mongoose = require('mongoose');
const User = require('./User');
const Message = require('./Message');

const ChatModel = mongoose.Schema(
    {
        chatName: {
            type: String,
            trim: true,
            required: true
        },
        isGroupChat: {
            type: Boolean,
            default: false,
        },
        groupAdmin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        latestMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message'
        },

    },
    {
        timestamps: true
    }
);

const Chat = mongoose.model('Chat', ChatModel);

module.exports = Chat;