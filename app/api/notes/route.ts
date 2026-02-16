import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const notes = await prisma.note.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(notes);
}

export async function POST(req: Request) {
  const body = await req.json();

  const note = await prisma.note.create({
    data: body,
  });

  return NextResponse.json(note, { status: 201 });
}
