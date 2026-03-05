import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // 2. Extract the companyId from the query string (?companyId=xxx)
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json(
        { error: "companyId is required" },
        { status: 400 },
      );
    }

    const services = await prisma.service.findMany({
      where: { companyId: companyId },
      orderBy: { createdAt: "desc" },
    });

    console.log("Fetched deals for companyId:", companyId, services);
    return NextResponse.json(services);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch deals" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const body = await req.json();

  console.log("Received service data:", body);

  const service = await prisma.service.create({
    data: {
      name: body.name,
      description: body.description,
      price: new Prisma.Decimal(body.price),
      companyId: body.companyId,
    },
  });

  return NextResponse.json(service, { status: 201 });
}
