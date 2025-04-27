import { NextRequest, NextResponse } from "next/server";
import { Authenticated, AuthenticationCheck, AuthenticationRole } from "./src/middlewares/authentication";

type MiddlewareFn = (request: NextRequest) => (Promise<NextResponse | void>);

async function RegisterMiddlewares(request: NextRequest, middlewares: MiddlewareFn[]): Promise<NextResponse> {
  for (const fn of middlewares) {
    const response = await fn(request);

    if (response instanceof NextResponse) {
      return response;
    }
  }

  const response = NextResponse.next();
  const prefixPath = [
    "/peserta",
    "/administrator",
    "/accounts",
    // untuk base path ("/") sedikit susah
  ];
  const pathname = request.nextUrl.pathname;
  const isValidPath = prefixPath.some(prefix => pathname.includes(prefix));
  if (isValidPath) {
    response.cookies.set("redirect-middleware", pathname);
  }
  // for (const prefix of prefixPath) {
  //   if (pathname.startsWith(prefix)) {
  //     console.log("di set")
  //     response.cookies.set("redirect-middleware", pathname);
  //     return response;
  //   }
  // }

  return response;
}

export async function middleware(request: NextRequest) {
  const middlewares = await RegisterMiddlewares(request, [
    AuthenticationCheck,
    Authenticated,
    AuthenticationRole,
  ]);
  return middlewares;
}