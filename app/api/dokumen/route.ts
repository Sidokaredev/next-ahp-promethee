import { db } from "@/src/databases/mysql/init";
import { tableDokumen } from "@/src/databases/mysql/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams.get("docid");
  if (!searchParams) {
    return NextResponse.json({
      name: "[docid] query param is required!",
      message: "undefined [docid] as query param on the request"
    }, { status: 400 });
  } else if (isNaN(Number(searchParams))) {
    return NextResponse.json({
      name: "invalid [docid] type value!",
      message: "[docid] query must be a valid number!"
    }, { status: 400 });
  }

  try {
    const dokumen = await db.query.tableDokumen.findFirst({
      where: eq(tableDokumen.id, Number(searchParams))
    });

    if (!dokumen) {
      return NextResponse.json({
        name: "data not found",
        message: `dokumen dengan id [${searchParams}] tidak dapat ditemukan!`
      }, { status: 404 });
    }

    return new NextResponse(dokumen.blob, {
      status: 200,
      headers: {
        "Content-Type": dokumen.mime_type,
        "Content-Disposition": `inline; filename="${dokumen.origin_name}"`,
        "Content-Length": dokumen.size.toString()
      }
    })
  } catch (err) {

  }

}