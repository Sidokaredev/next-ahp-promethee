import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose"
import { TokenPayload } from "@/src/services/accounts/auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");
  if (!token || token === "") {
    return NextResponse.json({
      name: "bad request",
      cause: "token dibutuhkan",
      message: "sertakan token sebagai query parameter [?token=value]"
    }, { status: 400 });
  }

  try {
    const secretToken = new Uint8Array(Buffer.from(process.env.SECRET_TOKEN!, "base64"));
    const { payload } = await jose.jwtDecrypt(token, secretToken);
    const { as: role } = payload as TokenPayload;

    return NextResponse.json({
      role
    }, { status: 200 });
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({
        name: err.name,
        cause: err.cause,
        message: err.message
      }, { status: 500 });
    }
  }
}