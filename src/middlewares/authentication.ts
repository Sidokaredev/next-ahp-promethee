import { NextRequest, NextResponse } from "next/server";

export async function AuthenticationCheck(request: NextRequest): Promise<NextResponse | void> {
  const authRequired = [
    "/peserta",
    "/administrator"
  ];
  const pathname = request.nextUrl.pathname;
  const isAuthRequired = authRequired.some((path) => pathname.startsWith(path));

  const hasAuthCookie = request.cookies.has("enc-cre");

  if (isAuthRequired && !hasAuthCookie) {
    return NextResponse.redirect(new URL("/accounts/signin", request.url));
  };
};

export async function Authenticated(request: NextRequest): Promise<NextResponse | void> {
  const noAuthRequired = [
    "/accounts"
  ];
  const pathname = request.nextUrl.pathname;
  const isNoAuthRequired = noAuthRequired.some((path) => pathname.startsWith(path));

  const hasAuthCookie = request.cookies.has("enc-cre");

  if (isNoAuthRequired && hasAuthCookie) {
    const referer = request.cookies.get("redirect-middleware");
    if (!referer) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    if (referer.value === request.nextUrl.pathname) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.redirect(new URL(referer.value, request.url));
  }
}

export async function AuthenticationRole(request: NextRequest): Promise<NextResponse | void> {
  const targetMatch = [
    "/peserta",
    "/administrator"
  ];
  const target = request.nextUrl.pathname;
  const isTargetMatch = targetMatch.some(match => target.startsWith(match));

  const hasAuthCookie = request.cookies.get("enc-cre");
  const referer = request.cookies.get("redirect-middleware");
  if (isTargetMatch && hasAuthCookie) {
    if (!referer) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // // cookies@update
    // const timeExp = new Date(Date.now() + 1 * 60 * 60 * 1000);
    // const cookieStore = await cookies();
    // cookieStore.set(hasAuthCookie.name, hasAuthCookie.value, {
    //   httpOnly: true,
    //   expires: timeExp,
    //   sameSite: "lax"
    // })

    // IF EXPIRED DIRECT TO LOGIN PAGE

    const req = await fetch(`http://localhost:3000/api/roles?token=${hasAuthCookie.value}`, { method: "GET" });
    const { role } = await req.json();

    const isTargetMatch = target.startsWith(`/${role}`);
    if (!isTargetMatch) {
      return NextResponse.redirect(new URL(referer.value, request.url));
    }
  }

}