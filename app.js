const express = require('express')
const dotenv = require('dotenv')
const { chats } = require('./data.js')
const connectDB = require('./db/connect')
const app = express()
const { notFound, errorHandler } = require('./middleware/errors')


dotenv.config()
app.use(express.json())
const cors = require('cors');

const corsOptions = {
    origin: process.env.FRONT_END_POINT,
    credentials: true,
    methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
    allowedHeaders: '*',       //access-control-allow-credentials:true
    optionSuccessStatus: 200
}
app.use(cors(corsOptions));

app.get('/', (req, res) => {
    res.send('Hello World!')
})

const authenticateUser = require('./middleware/auth.mw')

const userRouter = require('./routes/user.router.js');
const chatRouter = require('./routes/chat.router.js');
const messageRouter = require('./routes/message.router.js');

app.use('/api/v1/user', userRouter);
app.use('/api/v1/chat', authenticateUser, chatRouter);
app.use('/api/v1/message', authenticateUser, messageRouter);
app.use(notFound)
app.use(errorHandler)


const port = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI)
const server = app.listen(port, () =>
    console.log(`Server is listening on port ${port}...`)
);

const io = require('socket.io')(server, {
    cors: {
        origin: "https://chatz-yogesh04.vercel.app",
    },
    pingTimeout: 60000,

})

io.on('connection', (socket) => {
    console.log("connected to socket")

    socket.on('setup', (userData) => {
        socket.join(userData._id)
        console.log(userData);
        socket.emit('connected')
    })

    socket.on('join room', (room) => {
        socket.join(room)
        console.log(`Joined room ${room}`)
    })

    socket.on('typing', (room) => {
        socket.in(room).emit('typing')

    })
    socket.on('stopped typing', (room) => {
        socket.in(room).emit('stopped typing')

    })
    // socket.on('stopped typing', (room) => socket.in(room).emit('stopped typing'))

    socket.on('new message', (newMessage) => {
        var chatRoom = newMessage.chat;
        if (!chatRoom.participants) return console.log("chat.participants undefined")

        chatRoom.participants.forEach((p) => {
            if (p._id == newMessage.sender._id) return;
            //emit the message received event to all the other users 
            socket.in(p._id).emit('message received', newMessage)
        })
    })
    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    })
})