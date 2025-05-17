import { NextResponse } from "next/server";
import connectDB from "../../../../lib/dbConnect";
import Standar from "../../../../models/Standar";
import getCookieToken from "../../../../utils/getCookieToken";

// DELETE: /api/standar/:id
export async function DELETE(req) {
  await connectDB();
  const csrfTokenFromCookie = getCookieToken(req, "csrf_token");

  try {
    const body = await req.json();
    const { csrfToken, id } = body;
    if (
      !csrfTokenFromCookie ||
      !csrfToken ||
      csrfTokenFromCookie !== csrfToken
    ) {
      return NextResponse.json({ message: "Invalid CSRF" }, { status: 403 });
    }

    const deletedStandar = await Standar.findByIdAndDelete(id);

    if (!deletedStandar) {
      return NextResponse.json(
        { message: "Standar not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Standar deleted successfully",
      data: deletedStandar,
    });
  } catch (error) {
    console.error("Error deleting standar:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
