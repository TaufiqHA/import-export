import mongoose from "mongoose";
import { ObjectId } from "mongodb";

const ActualSchema = new mongoose.Schema({
  standarId: { type: ObjectId, required: true },
  output: { type: Number, required: true },
  rejectRate: { type: Number, required: true },
  downtime: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

// Hindari error redefinisi model (Next.js Dev mode sering reload)
const Actual =
  mongoose.models.Actual || mongoose.model("Actual", ActualSchema);

export default Actual;
