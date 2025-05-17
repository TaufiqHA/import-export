import { NextResponse } from "next/server";
import connectDB from "../../../../lib/dbConnect";
import Actual from "../../../../models/Actual";
import getCookieToken from "../../../../utils/getCookieToken";

// UPDATE: PUT /api/Actual/:id
export async function PUT(req) {
  await connectDB();
  const csrfTokenFromCookie = getCookieToken(req, "csrf_token");

  try {
    const body = await req.json();
    const { csrfToken, id, date, standarId, output, rejectRate, downtime } = body;
    if (
      !csrfTokenFromCookie ||
      !csrfToken ||
      csrfTokenFromCookie !== csrfToken
    ) {
      return NextResponse.json({ message: "Invalid CSRF" }, { status: 403 });
    }

    console.log(id, standarId)

    const updatedActual = await Actual.findByIdAndUpdate(
      id,
      {
        date,
        standarId,
        output,
        rejectRate,
        downtime,
      },
      { new: true } // ← return data setelah diupdate
    );

    if (!updatedActual) {
      return NextResponse.json(
        { message: "Actual not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Actual updated successfully",
      data: updatedActual,
    });
  } catch (error) {
    console.error("Error updating Actual:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
