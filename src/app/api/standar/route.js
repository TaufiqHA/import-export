import connectDB from "../../../lib/dbConnect";
import Standar from "../../../models/Standar";
import { NextResponse } from "next/server";

export async function GET(req) {
  await connectDB();

  try {
    const data = await Standar.find({});
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 400 });
  }
}
