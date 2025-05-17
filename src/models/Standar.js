import mongoose from "mongoose";

const StandarSchema = new mongoose.Schema({
  name: { type: String, required: true },
  output: { type: Number, required: true },
  rejectRate: { type: Number, required: true },
  downtime: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

// Hindari error redefinisi model (Next.js Dev mode sering reload)
const Standar =
  mongoose.models.Standar || mongoose.model("Standar", StandarSchema);

export default Standar;
