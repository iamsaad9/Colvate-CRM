import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const lead = await prisma.lead.findUnique({
    where: { id: id },
  });

  return NextResponse.json(lead);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const body = await req.json();

  const updated = await prisma.lead.update({
    where: { id: id },
    data: body,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  await prisma.lead.delete({
    where: { id: id },
  });

  return NextResponse.json({ message: "Deleted" });
}
