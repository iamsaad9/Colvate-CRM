import { NextResponse } from "next/server";
import  prisma from "@/app/lib/prisma";

// GET ALL
export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(leads);
  } catch {
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

// CREATE
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const lead = await prisma.lead.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        source: body.source,
        companyId: body.companyId,
        assignedTo: body.assignedTo,
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
