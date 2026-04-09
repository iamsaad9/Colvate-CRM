import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }, // Note: params is now a Promise
) {
  // 1. Await the params!
  const { id } = await params;

  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  console.log("Fetching service with ID:", id, "for company:", companyId);

  if (!id || !companyId) {
    return NextResponse.json(
      { error: "Missing ID or Company ID" },
      { status: 400 },
    );
  }

  const service = await prisma.service.findFirst({
    where: {
      id: id,
      companyId: companyId,
    },
    include: {
      deals: true,
      leads: true,
    },
  });

  if (!service) {
    return NextResponse.json({ error: "service not found" }, { status: 404 });
  }

  return NextResponse.json(service);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  const { searchParams } = new URL(req.url);
  const { name, description, isActive, price } = body;
  const companyId = searchParams.get("companyId");

  if (!id || !companyId) {
    return NextResponse.json(
      { error: "Missing ID or Company ID" },
      { status: 400 },
    );
  }

  try {
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (price !== undefined) updateData.price = price;

    const updatedService = await prisma.service.update({
      where: {
        id,
        companyId: companyId, // Security check
      },
      data: updateData,
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    return NextResponse.json(
      { error: "Service not found or update failed" },
      { status: 404 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await prisma.service.delete({
    where: { id: id },
  });

  return NextResponse.json({ message: "Deleted" });
}
