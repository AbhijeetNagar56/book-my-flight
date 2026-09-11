import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function SignUp (req, res) {
    try {
        const { name, email, mobile, gender, date_of_birth, password } = req.body;
        
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, msg: "User already exists." });
        }

        const password_hash = await bcrypt.hash(password, 10);
        
        const newUser = await User.create({
            username: name,
            email,
            mobile,
            gender,
            date_of_birth,
            password_hash
        });

        res.status(201).json({ success: true, msg: "User created successfully." });
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(500).json({ success: false, msg: "Internal Server Error." });
    }
}


export async function LogIn (req, res) {
    try {
        const { email, mobile, password } = req.body;
        
        // Find user by email OR mobile
        const user = await User.findOne({
            $or: [{ email: email || '' }, { mobile: mobile || '' }]
        });

        if (!user) {
            return res.status(400).json({ success: false, msg: "User does not exist." });
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(400).json({ success: false, msg: "Incorrect password." });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(200).json({ success: true, msg: "Logged in successfully.", key: token });
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(500).json({ success: false, msg: "Internal Server Error." });
    }
}