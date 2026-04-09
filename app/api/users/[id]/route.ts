import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

// PATCH: Update user details
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  const { searchParams } = new URL(req.url);
  const { name, role, isActive, avatarUrl, reportsToId, email } = body;
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
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (reportsToId !== undefined) updateData.reportsToId = reportsToId;
    if (email !== undefined) updateData.email = email;

    console.log("Editing with data:", updateData);

    const updatedUser = await prisma.user.update({
      where: {
        id,
        companyId: companyId, // Security check
      },
      data: updateData,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(
      { error: "User not found or update failed" },
      { status: 404 },
    );
  }
}

// DELETE: Remove user
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await prisma.user.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
