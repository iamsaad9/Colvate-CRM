// import { NextResponse } from "next/server";
// import { getCurrentUser } from "@/app/lib/get-current-user";

// export async function GET() {
//   const user = await getCurrentUser();
//   return NextResponse.json(user);
// }

import { cookies } from "next/headers";
import { verifyJwt } from "@/app/lib/jwt";
import prisma from "@/app/lib/prisma";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    console.log("Fetching user");
    const payload = verifyJwt(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        companyId: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}
