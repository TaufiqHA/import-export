import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from '../../../../models/User';
import connectDB from '../../../../lib/dbConnect'

export async function GET(req) {
  await connectDB();

  // Ambil token dari cookies
  const token = req.cookies.get("user_token")?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 401 });

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || typeof decoded === "string" || !decoded.id) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Ambil user dari database tanpa password_hash
    const user = await User.findById(decoded.id).select("-password_hash");

    if (!user) return NextResponse.json({ user: null }, { status: 404 });

    return NextResponse.json({ user });
  } catch (error) {
    let errorMessage = "Internal Server Error";

    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ user: null, error: errorMessage }, { status: 401 });
  }
}
