const errorHandler = require('express-async-handler')
const User = require('../models/User')

const registerUser = errorHandler(async (req, res) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
        res.status(400)
        throw new Error('Please fill all the fields')
    }
    //check if the user already exists
    const user = await User.findOne({ email })

    if (user) {
        res.status(400)
        throw new Error('User already exists')
    }

    const newUser = await User.create({ ...req.body });

    if (newUser) {
        const token = newUser.createJWT();
        res.status(201).json({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            isAdmin: newUser.isAdmin,
            dp: newUser.dp,
            token: token
        });
    } else {
        res.status(400);
        throw new Error('Failed to create user');
    }

});

const loginUser = errorHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        res.status(400)
        throw new Error('Please fill all the fields')
    }
    const user = await User.findOne({ email })

    if (!user) {
        res.status(400)
        throw new Error("User doesn't exist")
    }

    const isPasswordCorrect = await user.comparePassword(password)

    if (!isPasswordCorrect) {
        res.status(400)
        throw new Error('Incorrect credentials')
    }

    const token = user.createJWT();
    res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        dp: user.dp,
        token: token
    })
});

const getAllUsers = errorHandler(async (req, res) => {
    let query = {};
    if (req.query.search) {
        query = {
            $or: [
                { name: { $regex: '^' + req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } }
            ]
        }
    }

    const users = await User.find(query).find({ _id: { $ne: req.user._id } }).select("-password");
    res.send({ nb: users.length, data: users });

});

module.exports = { registerUser, loginUser, getAllUsers }