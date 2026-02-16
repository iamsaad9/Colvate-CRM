import { NextResponse } from "next/server";
import  prisma  from "@/app/lib/prisma";

// 🔹 GET ALL CUSTOMERS
export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

// 🔹 CREATE CUSTOMER
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, email, phone, companyId } = body;

    if (!name || !companyId) {
      return NextResponse.json(
        { error: "Name and Company ID required" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        companyId,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      
      { error: "Failed to create customer: "},
      { status: 500 }
    );
  }
}
