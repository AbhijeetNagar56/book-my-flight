import express from 'express';
import { SignUp, LogIn } from '../controllers/authController.js'
const router = express.Router();

// Signup
router.post('/signup', SignUp);

// Login
router.post('/login', LogIn);

export default router;