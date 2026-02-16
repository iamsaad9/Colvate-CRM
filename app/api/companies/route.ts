import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { authenticate } from "@/app/lib/auth";

// GET ALL COMPANIES
export async function GET(req: NextRequest) {
  const payload = authenticate(req);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const companies = await prisma.company.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(companies);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 },
    );
  }
}

// CREATE COMPANY
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: "Name and email required" },
        { status: 400 },
      );
    }

    const company = await prisma.company.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        website: body.website,
        logoUrl: body.logoUrl,
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 },
    );
  }
}
