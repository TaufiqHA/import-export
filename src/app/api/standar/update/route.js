import { NextResponse } from "next/server";
import connectDB from "../../../../lib/dbConnect";
import Standar from "../../../../models/Standar";
import getCookieToken from "../../../../utils/getCookieToken";

// UPDATE: PUT /api/standar/:id
export async function PUT(req) {
  await connectDB();
  const csrfTokenFromCookie = getCookieToken(req, "csrf_token");

  try {
    const body = await req.json();
    const { csrfToken, id, name, output, rejectRate, downtime } = body;
    if (
      !csrfTokenFromCookie ||
      !csrfToken ||
      csrfTokenFromCookie !== csrfToken
    ) {
      return NextResponse.json({ message: "Invalid CSRF" }, { status: 403 });
    }

    const updatedStandar = await Standar.findByIdAndUpdate(
      id,
      {
        name,
        output,
        rejectRate,
        downtime,
      },
      { new: true } // ← return data setelah diupdate
    );

    if (!updatedStandar) {
      return NextResponse.json(
        { message: "Standar not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Standar updated successfully",
      data: updatedStandar,
    });
  } catch (error) {
    console.error("Error updating standar:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
