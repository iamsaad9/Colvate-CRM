import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET() {
  const deals = await prisma.deal.findMany({
    include: {
      customer: true,
      user: true,
    },
  });

  return NextResponse.json(deals);
}

export async function POST(req: Request) {
  const body = await req.json();

  const deal = await prisma.deal.create({
    data: {
      title: body.title,
      value: body.value,
      stage: body.stage,
      expectedCloseDate: body.expectedCloseDate,
      companyId: body.companyId,
      customerId: body.customerId,
      assignedTo: body.assignedTo,
    },
  });

  return NextResponse.json(deal, { status: 201 });
}
