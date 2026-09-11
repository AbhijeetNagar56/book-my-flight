import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  mobile: { type: String, unique: true, sparse: true }, // sparse allows multiple null/missing values
  gender: { 
    type: String, 
    enum: ['male', 'female', 'other'] 
  },
  date_of_birth: { type: Date },
  password_hash: { type: String, required: true }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

const User = mongoose.model('User', userSchema);
export default User;