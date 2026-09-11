import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path'

import connectDB from './config/db.js';
import authMiddleware from './middlewares/middleware.js';

import authRoutes from './routes/authRoutes.js';
import flightRoutes from './routes/flightRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();
connectDB();

const __dirname = path.resolve();
const frontend_dir = path.join(__dirname, "../frontend/dist");



const app = express();
const port = 5678;

app.use(express.static(frontend_dir));

// middleware
app.use(cors({
    origin: [process.env.FRONTEND_URL, '/']
}));
app.use(express.json());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/user', authMiddleware, userRoutes);
app.use('/api/airport', flightRoutes);
app.get('/api', (req, res) => {
    try {
        res.status(200).json({ success: true, msg: "book-my-flight ready..."})
    } catch(err) {
        res.status(500).json({ success: false, msg: "Internal server Error."});
        console.log("Error : ", err.message);
    }
    
});
app.get("/*", (req, res) => {
    try {
        res.status(200).sendFile(frontend_dir, "index.html");
    } catch(e) {
        console.log("Error: ", e);
        res.status(500).json({msg: "Internal Server Error"});
    }
});

app.listen(port, () => {
    console.log(`book-my-flight backend is running on http://127.0.0.1:${port}`);
})
