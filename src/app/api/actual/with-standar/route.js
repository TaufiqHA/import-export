import connectDB from "../../../../lib/dbConnect";
import Actual from "../../../../models/Actual";
import Standar from "../../../../models/Standar";
import { NextResponse } from "next/server";
import dayjs from "dayjs";

export async function GET() {
  await connectDB();

  try {
    const actual = await Actual.find({});
    const standar = await Standar.find({});

    const actualFormatted = actual.map((item) => {
        const standarItem = standar.find((s) => s._id.toString() === item.standarId.toString()) || {};
      
        const formattedDate = dayjs(item.date).format("YYYY-MM-DD");
      
        return {
          _id: item._id,
          name: standarItem.name || "",
          date: formattedDate,
          output_standard: standarItem.output || 0,
          output_actual: item.output || 0,
          reject_standard: standarItem.rejectRate || 0,
          reject_actual: item.rejectRate || 0,
          downtime_standard: standarItem.downtime || 0,
          downtime_actual: item.downtime || 0,
        };
      });
      

    return new NextResponse(JSON.stringify({ actualFormatted, standar }, null, 2), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 400 });
  }
}
