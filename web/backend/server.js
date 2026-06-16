import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import route from './routes/route.js'
import connectDB from './config/db.js';

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
app.use('/api', route);
app.get('/api', (req, res) => {
    try {
        res.status(200).json({ success: true, msg: "book-my-flight ready..."})
    } catch(err) {
        res.status(500).json({ success: false, msg: "Internal server Error."});
        console.log("Error : ", err.message);
    }
    
});

app.listen(port, () => {
    console.log(`book-my-flight backend is running on http://127.0.0.1:${port}`);
})
