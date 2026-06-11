import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import { pool, connectDB } from './psql.js';
import routes from './route.js';

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT || 6789;

// middleware
app.use(cors({
    origin: "*"
}));
app.use(express.json());

// routes
app.get('/api', (req, res) => {
    try {
        res.status(200).json({ success: true, msg: "book-my-flight ready..."})
    } catch(err) {
        res.status(500).json({ success: false, msg: "Internal server Error."});
        console.log("Error : ", err.message);
    }
    
});
app.get('/api/db', async (req, res) => {
    try {
        const response = await pool.query('SELECT NOW()');
        res.status(200).json({ success: true, msg: "book-my-flight database ready..."})
    } catch(err) {
        res.status(500).json({ success: false, msg: "Internal server Error."});
        console.log("Error : ", err.message);
    }
})



app.listen(port, () => {
    console.log(`book-my-flight backend is running on http://127.0.0.1:${port}/api`);
})
