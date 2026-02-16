import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();

  const updated = await prisma.deal.update({
    where: { id: id },
    data: body,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await prisma.deal.delete({
    where: { id: id },
  });

  return NextResponse.json({ message: "Deleted" });
}
