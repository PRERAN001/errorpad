import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';

import User from './model/usermodel.js';

const app = express();
const port = process.env.PORT || 8000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.mongodburl)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));


io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join-room', (roomName) => {
        socket.join(roomName);
        console.log(`User joined room: ${roomName}`);
    });

    socket.on('update-content', async (data) => {
        const { roomName, usercontext } = data;

        socket.to(roomName).emit('receive-content', usercontext);

        try {
            await User.findOneAndUpdate(
                { userquery: roomName },
                { usercontext: usercontext },
                { upsert: true }
            );
        } catch (error) {
            console.error("Error updating DB via socket:", error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});


app.get('/:userquery', async (req, res) => {
    const userquery = req.params.userquery;
    try {
        const user = await User.findOne({ userquery });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/v1/:userquery', async (req, res) => {
    const userquery = req.params.userquery;
    try {
        const user = await User.findOne({ userquery });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const formattedContent = user.usercontext.replace(/\\n/g, '\n');
        res.setHeader('Content-Type', 'text/plain');
        res.status(200).send(formattedContent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/v1/:userquery', async (req, res) => {
    const userquery = req.params.userquery;
    const  usercontext  = req.body;
    try {
        const user = await User.findOneAndUpdate(
            { userquery },
            { usercontext },
            { new: true, upsert: true }
        );
        res.status(201).json({"message":"done enjoy !! (updated)"});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


httpServer.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
