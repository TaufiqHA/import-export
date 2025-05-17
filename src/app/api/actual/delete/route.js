import { NextResponse } from "next/server";
import connectDB from "../../../../lib/dbConnect";
import Actual from "../../../../models/Actual";
import getCookieToken from "../../../../utils/getCookieToken";

// DELETE: /api/Actual/:id
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

    const deletedActual = await Actual.findByIdAndDelete(id);

    if (!deletedActual) {
      return NextResponse.json(
        { message: "Actual not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Actual deleted successfully",
      data: deletedActual,
    });
  } catch (error) {
    console.error("Error deleting Actual:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
