import { NextResponse } from "next/server";
import Actual from "../../../../models/Actual";
import connectDB from "../../../../lib/dbConnect";
import getCookieToken from "../../../../utils/getCookieToken";

export async function POST(req) {
  await connectDB();
  const csrfTokenFromCookie = getCookieToken(req, "csrf_token");

  try {
    const body = await req.json();
    const { date, csrfToken, standarId, output, rejectRate, downtime } = body;

    if (
      !csrfTokenFromCookie ||
      !csrfToken ||
      csrfTokenFromCookie !== csrfToken
    ) {
      return NextResponse.json({ message: "Invalid CSRF" }, { status: 403 });
    }

    const newActual = new Actual({
      standarId,
      output,
      rejectRate,
      downtime,
      date : date?? new Date(), 
    });
    await newActual.save();
    
    return NextResponse.json(
      { message: "Actual created successfully", data: newActual },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { message: "Internal server error", error },
      { status: 500 }
    );
  }
}
