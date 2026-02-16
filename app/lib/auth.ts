import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "./jwt";

export function authenticate(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyJwt(token);

  if (!payload) return null;

  return payload as { userId: string; companyId: string; role: string };
}
