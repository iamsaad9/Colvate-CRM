import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { companyName, email, password } = await req.json();

  if (!companyName || !email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const company = await prisma.company.create({
    data: { name: companyName, email },
  });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: "Admin",
      email,
      passwordHash: hashedPassword,
      role: "ADMIN",
      companyId: company.id,
    },
  });

  return NextResponse.json({ company, user }, { status: 201 });
}
