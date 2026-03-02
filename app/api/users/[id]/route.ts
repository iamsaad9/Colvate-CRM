import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

// PATCH: Update user details
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const { name, role, isActive, avatarUrl } = body;

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
        ...(avatarUrl && { avatarUrl }),
      },
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
  { params }: { params: { id: string } },
) {
  try {
    // Check if user has associated deals/leads before deleting
    // or use a 'Soft Delete' by setting isActive: false
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
