import connectDB from "../../../lib/dbConnect";
import User from "../../../models/User";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  try {
    const data = await User.find({});
    return NextResponse.json({ user: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 400 });
  }
}
