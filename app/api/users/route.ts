import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

// GET: Fetch all users for the current company
export async function GET(req: Request) {
  try {
    // 1. Get the URL from the request
    const { searchParams } = new URL(req.url);

    // 2. Extract the companyId from the query string (?companyId=xxx)
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json(
        { error: "companyId is required" },
        { status: 400 },
      );
    }

    const users = await prisma.user.findMany({
      where: { companyId: companyId },

      include: {
        deals: true,
        tasks: true,
        leads: true,
        customers: true,
      },

      orderBy: { name: "asc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("GET_USERS_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

// POST: Create a new team member
export async function POST(req: Request) {
  try {
    const { name, email, role, companyId, reportsToId } = await req.json();
    const password = `${name}123`;

    if (!email || !companyId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash: hashedPassword,
        role,
        companyId,
        reportsToId: reportsToId,
      },
    });

    // Don't return the password hash to the frontend
    const { passwordHash: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
