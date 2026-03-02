import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { fullname, companyName, email, password } = await req.json();

    if (!companyName || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. THE GUARD: Check and Return
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. THE TRANSACTION: Atomic creation
    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: { name: companyName, email: cleanEmail },
      });

      const user = await tx.user.create({
        data: {
          name: fullname,
          email: cleanEmail,
          passwordHash: hashedPassword,
          role: "ADMIN",
          companyId: company.id,
        },
      });

      return { company, user };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
