import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "../../../../models/User";
import connectDB from "../../../../lib/dbConnect";
import getCookieToken from "../../../../utils/getCookieToken";

export async function POST(req) {
  try {
    await connectDB();
    const { name, email, password, phone, csrfToken } = await req.json();
    const csrfTokenFromCookie = getCookieToken(req, "csrf_token");

    if (!csrfTokenFromCookie || !csrfToken || csrfTokenFromCookie !== csrfToken) {
      return NextResponse.json({ message: "Invalid CSRF" }, { status: 403 });
    }

    // Cek apakah email sudah ada
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "Email already exists" }, { status: 400 });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Simpan user ke database
    const newUser = new User({
      name,
      email,
      password_hash,
      phone,
      profile_image: "", // Kosong dulu
      isAdmin: false,
      isActive: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    await newUser.save();
    
    return NextResponse.json({ message: "User registered successfully!" }, { status: 201 });
  } catch (error) {
    let errorMessage = "Internal Server Error";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error("Signup Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: errorMessage },
      { status: 500 }
    );
  }
}