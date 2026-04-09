import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, companyName, email, password } = body;

    if (!companyName || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const cleanEmail = email.toLowerCase().trim();

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
    if (!fullName || !email || !password || !companyName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. THE TRANSACTION
    // This ensures if User creation fails, the Company isn't left hanging.
    const result = await prisma.$transaction(async (tx) => {
      // Create the Company first
      const company = await tx.company.create({
        data: {
          name: companyName,
          email: cleanEmail,
        },
      });

      // Create the User and link it to the company ID
      const user = await tx.user.create({
        data: {
          name: fullName, // Matches your schema 'name'
          email: cleanEmail,
          passwordHash: hashedPassword,
          role: "ADMIN", // Assigning first user as Admin
          companyId: company.id,
        },
      });

      return { company, user };
    });

    return NextResponse.json(
      { message: "Signup successful", result },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Signup error details:", error);

    // Handle unique constraint (e.g., email already exists)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
