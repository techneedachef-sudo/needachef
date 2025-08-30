import { NextRequest, NextResponse } from "next/server";
import { USER_COOKIE_NAME } from "@/utils/constants";
import { SignJWT } from "jose";
import prisma from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import { withErrorHandler } from "../../_lib/apiErrorHandler";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

async function postHandler(request: NextRequest) {
  const { email, password, redirect } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
      where: { email },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatch) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  // Determine redirect URL
  let redirectUrl;
  if (redirect) {
    redirectUrl = redirect;
  } else {
    switch (user.role) {
      case "ADMIN":
        redirectUrl = "/admin/dashboard";
        break;
      case "PARTNER":
        redirectUrl = "/partner/dashboard";
        break;
      case "CHEF":
      case "USER":
        redirectUrl = "/dashboard";
        break;
      default:
        redirectUrl = "/"; // Fallback for any other roles
    }
  }

  // Create the JWT
  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d") // Token expires in 1 day
    .sign(JWT_SECRET);

  const { passwordHash: _, ...userResponse } = user;
  const response = NextResponse.json({ ...userResponse, redirectUrl });

  // Set the session cookie
  response.cookies.set(USER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });

  return response;
}

export const POST = withErrorHandler(postHandler);

