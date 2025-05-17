import { NextResponse } from "next/server";
import Standar from "../../../../models/Standar";
import connectDB from "../../../../lib/dbConnect";
import getCookieToken from "../../../../utils/getCookieToken";

export async function POST(req) {
  await connectDB();
  const csrfTokenFromCookie = getCookieToken(req, "csrf_token");

  try {
    const body = await req.json();
    const { csrfToken, name, output, rejectRate, downtime } = body;

    if (
      !csrfTokenFromCookie ||
      !csrfToken ||
      csrfTokenFromCookie !== csrfToken
    ) {
      return NextResponse.json({ message: "Invalid CSRF" }, { status: 403 });
    }

    const existingStandar = await Standar.findOne({ name });
    if (existingStandar) {
      return NextResponse.json(
        { message: "Name already exists" },
        { status: 400 }
      );
    }

    const newStandar = new Standar({
      name,
      output,
      rejectRate,
      downtime,
      date: new Date(),
    });

    await newStandar.save();

    return NextResponse.json(
      { message: "Standar created successfully", data: newStandar },
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
