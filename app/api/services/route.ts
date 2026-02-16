import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const services = await prisma.service.findMany();
  return NextResponse.json(services);
}

export async function POST(req: Request) {
  const body = await req.json();

  const service = await prisma.service.create({
    data: {
      name: body.name,
      description: body.description,
      price: body.price,
      companyId: body.companyId,
    },
  });

  return NextResponse.json(service, { status: 201 });
}
