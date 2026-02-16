import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

// 🔹 GET SINGLE CUSTOMER
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  console.log("Fetching customer with ID:", id); // Debug log
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: id },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 },
    );
  }
}

// 🔹 UPDATE CUSTOMER
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await req.json();

    const updatedCustomer = await prisma.customer.update({
      where: { id: id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        status: body.status,
      },
    });

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 },
    );
  }
}

// 🔹 DELETE CUSTOMER
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await prisma.customer.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Customer deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 },
    );
  }
}
