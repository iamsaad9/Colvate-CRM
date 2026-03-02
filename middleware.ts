import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
// import { ratelimit } from '@/app/lib/ratelimit';

// 1. Explicitly define which routes NEED a login
const protectedRoutes = ["/dashboard", "/deals", "/leads", "/documents"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. RATE LIMITING (Move to top)
  //   if (pathname.startsWith('/api')) {
  //     const headerList = await headers();
  // const ip = headerList.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1"
  //     const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  //     if (!success) {
  //       return NextResponse.json(
  //         { error: 'Too many requests' },
  //         {
  //           status: 429,
  //           headers: {
  //             'X-RateLimit-Limit': limit.toString(),
  //             'X-RateLimit-Remaining': remaining.toString(),
  //             'X-RateLimit-Reset': reset.toString(),
  //           }
  //         }
  //       );
  //     }
  //   }

  // 2. AUTHENTICATION LOGIC
  const token = req.cookies.get("token")?.value;
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthRoute = ["/login", "/signup", "/reset-password"].some((route) =>
    pathname.startsWith(route),
  );

  // If it's a public page (not protected, not auth, not api), let it pass
  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  // Redirect if trying to access protected page without token
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);

      // Prevent logged-in users from seeing login/signup pages
      if (isAuthRoute) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    } catch (err) {
      if (isProtectedRoute) {
        const response = NextResponse.redirect(new URL("/login", req.url));
        response.cookies.delete("token");
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
