import connectDB from "../../../lib/dbConnect";
import Actual from "../../../models/Actual";
import { NextResponse } from "next/server";

export async function GET(req) {
  await connectDB();

  try {
    const data = await Actual.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 400 });
  }
}
