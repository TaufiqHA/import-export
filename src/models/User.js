import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  phone: { type: String },
  isAdmin: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Hindari error redefinisi model (Next.js Dev mode sering reload)
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
