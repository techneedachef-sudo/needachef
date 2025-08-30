import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "../_lib/constants";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0), // Expire the cookie immediately
  });
  return response;
}
