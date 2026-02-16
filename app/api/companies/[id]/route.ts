import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

// GET SINGLE COMPANY
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: { id: id },
  });

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  return NextResponse.json(company);
}

// UPDATE COMPANY
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();

  const updated = await prisma.company.update({
    where: { id: id },
    data: body,
  });

  return NextResponse.json(updated);
}

// DELETE COMPANY
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await prisma.company.delete({
    where: { id: id },
  });

  return NextResponse.json({ message: "Company deleted" });
}
