import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

// GET ALL
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // 2. Extract the companyId from the query string (?companyId=xxx)
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json(
        { error: "companyId is required" },
        { status: 400 },
      );
    }

    const leads = await prisma.lead.findMany({
      where: { companyId: companyId },
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });

    console.log("Fetched leads for companyId:", companyId, leads);
    return NextResponse.json(leads);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 },
    );
  }
}

// CREATE
export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("Received lead data:", body);

    const lead = await prisma.lead.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        status: body.status,
        source: body.source,
        companyId: body.companyId,
        assignedTo: body.assignedTo,
      },
    });

    console.log("Created lead:", lead);
    return NextResponse.json(lead, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 },
    );
  }
}
