import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Custom logic if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/vehicles/:path*",
    "/expenses/:path*",
    "/employee/:path*",
    "/reports/:path*",
    "/purchases/:path*",
    "/sales/:path*",
    "/sellers/:path*",
    "/customers/:path*",
    "/settings/:path*",
  ],
};
