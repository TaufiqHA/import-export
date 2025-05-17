import { NextResponse } from "next/server";
import connectDB from "../../../../lib/dbConnect";
import User from "../../../../models/User";
import getCookieToken from "../../../../utils/getCookieToken";

// UPDATE: PUT /api/User/:id
export async function PUT(req) {
  await connectDB();
  const csrfTokenFromCookie = getCookieToken(req, "csrf_token");

  try {
    const body = await req.json();
    const { csrfToken, id} = body;
    if (
      !csrfTokenFromCookie ||
      !csrfToken ||
      csrfTokenFromCookie !== csrfToken
    ) {
      return NextResponse.json({ message: "Invalid CSRF" }, { status: 403 });
    }

    const updatedDeactive = await User.findByIdAndUpdate(
      id,
      {
        isActive: false,
      },
      { new: true } // ← return data setelah diupdate
    );

    if (!updatedDeactive) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "User updated successfully",
      data: updatedDeactive,
    });
  } catch (error) {
    console.error("Error updating User:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
