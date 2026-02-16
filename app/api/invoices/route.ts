import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const invoices = await prisma.invoice.findMany({
    include: { customer: true },
  });

  return NextResponse.json(invoices);
}

export async function POST(req: Request) {
  const body = await req.json();

  const invoice = await prisma.invoice.create({
    data: {
      companyId: body.companyId,
      customerId: body.customerId,
      invoiceNumber: body.invoiceNumber,
      totalAmount: body.totalAmount,
      dueDate: body.dueDate,
    },
  });

  return NextResponse.json(invoice, { status: 201 });
}
