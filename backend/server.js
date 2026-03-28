import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';

// Import your model - Ensure your usermodel.js uses 'export default'
import User from './model/usermodel.js';

const app = express();
const port = process.env.PORT || 8000;

// Create HTTP server to handle both Express and WebSockets
const httpServer = createServer(app);

// Initialize Socket.io with CORS
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Adjust this to your frontend URL in production
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.mongodburl)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));


io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // When a user opens a specific URL/path
    socket.on('join-room', (roomName) => {
        socket.join(roomName);
        console.log(`User joined room: ${roomName}`);
    });

    // Handle real-time typing updates
    socket.on('update-content', async (data) => {
        const { roomName, usercontext } = data;

        // Broadcast to everyone in the room EXCEPT the sender
        socket.to(roomName).emit('receive-content', usercontext);

        // PERSISTENCE: Save to DB
        // Note: The frontend should debounce this call to avoid hitting Mongo 60 times a second
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

// Post route kept for fallback/legacy support
app.post('/:userquery', async (req, res) => {
    const userquery = req.params.userquery;
    const { usercontext } = req.body;
    try {
        const user = await User.findOneAndUpdate(
            { userquery },
            { usercontext },
            { new: true, upsert: true }
        );
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CRITICAL: Use httpServer.listen, NOT app.listen
httpServer.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});