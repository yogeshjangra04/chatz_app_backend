const errorHandler = require('express-async-handler')
const Chat = require('../models/Chat')
const User = require('../models/User')

const getDirectChat = errorHandler(async (req, res) => {

    //participant ID (pid) -> id of the other user
    const pid = req.body.userId
    if (!pid) {
        res.status(400)
        throw new Error('Id of Participant is required!')
    }

    //find a chat that is not a group chat
    //and has the id in the participants array
    //channel -> direct chat 
    var channel = await Chat.findOne({
        isGroupChat: false,
        participants: { $all: [req.user._id, pid] }
    }).populate("participants", "-password")

    if (channel) {
        //populate the latest message of the chat

        channel = await User.populate(channel, {
            path: "latestMessage.sender",
            select: "name pic email"
        })

        res.send(channel)
    } else {
        //if no channel is found, create a new one
        var newChannel = {
            chatName: "Sender",
            isGroupChat: false,
            participants: [req.user._id, pid],
            latestMessage: null
        }
        try {
            const createdChat = await Chat.create(newChannel)
            const finalChat = await Chat.findOne({ _id: createdChat._id }).populate(
                "participants", "-password")
            res.status(200).json(finalChat);

        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }

    }

});

const fetchChats = errorHandler(async (req, res) => {
    //fetch all the chats that the logged in user is a part of
    try {
        Chat.find({ participants: { $all: [req.user._id] } })
            .populate("participants", "-password")
            .populate("latestMessage")
            .populate("groupAdmin", "-password")
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await User.populate(results, {
                    path: "latestMessage.sender",
                    select: "name pic email"
                })
                res.status(200).json({ nb: results.length, data: results });
            })
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }


});

const createGroup = errorHandler(async (req, res) => {
    //create a group chat
    //group name, group admin, participants, latest message
    const { chatName, participants } = req.body
    if (!chatName || !participants) {
        res.status(400)
        throw new Error('Name and Participants are required!')
    }
    // var participantsArray = participants;
    var participantsArray = JSON.parse(participants)
    if (participantsArray.length < 2) {
        res.status(400)
        throw new Error('At least 2 participants are required!')
    }
    participantsArray.push(req.user._id)

    var newGroup = {
        chatName: chatName,
        isGroupChat: true,
        groupAdmin: req.user._id,
        participants: participantsArray,
    }

    try {
        const createdChat = await Chat.create(newGroup)
        const finalChat = await Chat.findOne({ _id: createdChat._id }).populate("participants", "-password").populate("groupAdmin", "-password");
        res.status(200).json(finalChat);

    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
})

const renameGroup = errorHandler(async (req, res) => {
    //rename a group chat
    const { chatId, chatName } = req.body
    if (!chatId || !chatName) {
        res.status(400)

        throw new Error('Chat Id and Name are required!')
    }
    try {
        const updatedChat = await Chat.findOneAndUpdate(
            { _id: chatId },
            { chatName: chatName },
            { new: true }
        ).populate("participants", "-password").populate("groupAdmin", "-password");

        if (!updatedChat) {
            res.status(404)
            throw new Error('Chat not found!')
        }
        res.status(200).json(updatedChat);

    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
})

const addUserToGroup = errorHandler(async (req, res) => {
    //add a user to a group chat

    const { chatId, userId } = req.body

    if (!chatId || !userId) {
        res.status(400)
        throw new Error('Chat Id and User Id are required!')
    }

    //check if the person calling function is the admin or not

    const chat = await Chat.findById({ _id: chatId });
    // console.log(typeof req.user._id, typeof chat.groupAdmin);
    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error("Not authorized");
    }

    try {
        const updatedChat = await Chat.findOneAndUpdate(
            { _id: chatId },
            { $push: { participants: userId } },
            { new: true }
        ).populate("participants", "-password").populate("groupAdmin", "-password");

        if (!updatedChat) {
            res.status(404)
            throw new Error('Chat not found!')
        }

        res.status(200).json(updatedChat);

    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
})

const removeUserFromGroup = errorHandler(async (req, res) => {
    //remove a user from a group chat
    const { chatId, userId } = req.body
    if (!chatId || !userId) {
        res.status(400)
        throw new Error('Chat Id and User Id are required!')
    }

    //check if the person calling function is the admin or not

    // const chat = await Chat.findById({ _id: chatId });

    // if (chat.groupAdmin.toString() !== req.user._id.toString()) {
    //     res.status(401);
    //     throw new Error("Only Group Admins can delete");
    // }


    try {
        const updatedChat = await Chat.findOneAndUpdate(
            { _id: chatId },
            { $pull: { participants: userId } },
            { new: true }
        ).populate("participants", "-password").populate("groupAdmin", "-password");

        if (!updatedChat) {
            res.status(404)
            throw new Error('Chat not found!')
        }

        res.status(200).json(updatedChat);

    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
})

module.exports = { getDirectChat, fetchChats, createGroup, renameGroup, addUserToGroup, removeUserFromGroup }