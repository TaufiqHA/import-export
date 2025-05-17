import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../../../models/User"; // Pastikan path ini sesuai dengan struktur folder Anda
import connectDB from "../../../../lib/dbConnect"; // Pastikan path ini sesuai dengan struktur folder Anda
import getCookieToken from "../../../../utils/getCookieToken"; //

export async function POST(req) {
  try {
    await connectDB();

    // Ambil token CSRF dari cookie dan request body
    const csrfTokenFromCookie = getCookieToken(req, "csrf_token");
    const { email, password, csrfToken } = await req.json(); // Gunakan nama yang lebih standar

    // Perbaiki validasi CSRF token
    if (!csrfTokenFromCookie || !csrfToken || csrfTokenFromCookie !== csrfToken) {
      return NextResponse.json({ message: "Invalid CSRF" }, { status: 403 });
    }

    // Cek apakah user ada di database
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    // Bandingkan password dengan hash di database
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    // Buat token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Simpan token di cookies HTTP-only
    const response = NextResponse.json({ message: "Login successful" });
    response.cookies.set("user_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login Error:", error);
    let errorMessage = "Internal Server Error";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { message: "Internal Server Error", error: errorMessage },
      { status: 500 }
    );
  }
}
