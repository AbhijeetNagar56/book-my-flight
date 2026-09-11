import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Check if header exists and starts with "Bearer "
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                msg: "Authorization header missing or malformed"
            });
        }

        // Safely extract the token string part
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                msg: "Token missing"
            });
        }

        // Verify using the exact variable name matching your route.js (JWT_SECRET)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to the request object
        // In MongoDB, the primary key is a string or ObjectId matching decoded.userId
        req.user = {
            id: decoded.userId
        };

        // Pass control to the next handler function safely
        next();

    } catch (err) {
        console.error("Auth Middleware Error:", err.message);
        return res.status(401).json({
            success: false,
            msg: "Invalid or expired token"
        });
    }
};

export default authMiddleware;