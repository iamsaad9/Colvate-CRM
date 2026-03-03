import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

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

    const deals = await prisma.deal.findMany({
      where: { companyId: companyId },
      orderBy: { createdAt: "desc" },
      include: { services: true, user: true },
    });

    console.log("Fetched leads for companyId:", companyId, deals);
    return NextResponse.json(deals);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch deals" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { expectedCloseDate } = body;

    const formattedDate = expectedCloseDate
      ? new Date(expectedCloseDate)
      : null;

    console.log("Creating deal with data:", body);

    const deal = await prisma.deal.create({
      data: {
        title: body.title,
        value: body.value,
        stage: body.stage,
        expectedCloseDate: formattedDate,
        companyId: body.companyId,
        customerId: body.customerId || null,
        assignedTo: body.assignedTo || null,
        services:
          body.serviceIds && body.serviceIds.length > 0
            ? {
                connect: body.serviceIds.map((id: string) => ({ id })),
              }
            : undefined,
      },
    });

    return NextResponse.json(deal, { status: 201 });
  } catch (error) {
    console.error("DEAL CREATE ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create deal" },
      { status: 500 },
    );
  }
}
