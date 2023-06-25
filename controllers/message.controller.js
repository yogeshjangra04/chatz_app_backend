const errorHandler = require('express-async-handler')
const Message = require('../models/Message')
const User = require('../models/User')
const Chat = require('../models/Chat')

const sendMessage = errorHandler(async (req, res) => {
    const { chatId, content } = req.body
    if (!chatId || !content) {
        res.status(400)
        throw new Error('Please fill all the fields')
    }
    // console.log(req.user);

    let messageData = {
        sender: req.user._id,
        content: content,
        chat: chatId
    }

    var newMessage = await Message.create(messageData)
    newMessage = await newMessage.populate("sender", "-password").populate("chat").execPopulate();

    newMessage = await User.populate(newMessage, {
        path: "chat.participants",
        select: "name dp email"
    })


    if (newMessage) {
        await Chat.findByIdAndUpdate(chatId, { latestMessage: newMessage._id })

        res.status(201).json({
            message: newMessage
        });
    } else {
        res.status(400);
        throw new Error('Failed to create message');
    }
})

const getAllMessages = errorHandler(async (req, res) => {
    const chatId = req.params.chatId
    const messages = await Message.find({ chat: chatId }).populate("sender", "-password").populate("chat");
    res.status(200).json({
        nb: messages.length, messages
    })
})

module.exports = { sendMessage, getAllMessages }

