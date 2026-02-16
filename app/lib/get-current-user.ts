import { cookies } from "next/headers";
import { verifyJwt } from "@/app/lib/jwt";
import prisma from "@/app/lib/prisma";

export async function getCurrentUser() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;

  try {
    const payload = verifyJwt(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    return user;
  } catch (error) {
    return null;
  }
}
