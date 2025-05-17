import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.json({ message: "Logout successful" });

  // Menghapus cookie dengan mengatur tanggal expired ke masa lalu
  response.cookies.set("user_token", "", {
    expires: new Date(0), // Set kedaluwarsa agar cookie terhapus
    path: "/", // Pastikan cookie dihapus di seluruh path
    httpOnly: true, // Jaga keamanan cookie
    secure: process.env.NODE_ENV === "production", // Gunakan secure jika di production
  });

  return response;
}
