import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }, // Note: params is now a Promise
) {
  // 1. Await the params!
  const { id } = await params;

  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  console.log("Fetching lead with ID:", id, "for company:", companyId);

  if (!id || !companyId) {
    return NextResponse.json(
      { error: "Missing ID or Company ID" },
      { status: 400 },
    );
  }

  const lead = await prisma.lead.findFirst({
    where: {
      id: id,
      companyId: companyId,
    },
    include: { services: true, user: true },
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json(lead);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: routeId } = await params;
  const body = await req.json();
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  const ids = routeId.split(",");

  const { ...validData } = body;

  if (!routeId || routeId === "undefined" || !companyId) {
    return NextResponse.json(
      { error: "Missing ID or Company ID" },
      { status: 400 },
    );
  }

  console.log(
    "Updating lead:",
    ids,
    "with data:",
    validData,
    "for company:",
    companyId,
  );

  try {
    const result = await prisma.$transaction(
      ids.map((id) =>
        prisma.lead.update({
          where: {
            id,
            companyId: companyId as string,
          },
          data: {
            name: body.name,
            email: body.email,
            phone: body.phone,
            status: body.status,
            source: body.source,
            companyId: body.companyId,
            assignedTo: body.assignedTo,
            services: {
              set: body.serviceIds?.map((id: string) => ({ id })) || [],
            },
          },
        }),
      ),
    );

    return NextResponse.json({
      message: `Updated ${result.length} leads`,
      count: result.length,
    });
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: routeId } = await params;
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  const ids = routeId.split(",");

  if (!routeId || routeId === "undefined" || !companyId) {
    return NextResponse.json(
      { error: "Missing ID or Company ID" },
      { status: 400 },
    );
  }

  try {
    const result = await prisma.lead.deleteMany({
      where: {
        id: { in: ids },
        companyId: companyId as string,
      },
    });

    return NextResponse.json({
      message: `Deleted ${result.count} leads`,
      count: result.count,
    });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: routeId } = await params;
    const body = await req.json();
    const { status, assignedTo, serviceIds } = body;
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    const ids = routeId.split(",");

    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 },
      );
    }

    // Build the update object dynamically
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (serviceIds !== undefined) {
      updateData.services = {
        set: serviceIds.map((id: string) => ({ id })),
      };
    }

    // Check if there's actually anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update" },
        { status: 400 },
      );
    }

    const results = await Promise.all(
      ids.map((id) =>
        prisma.lead.update({
          where: {
            id,
            companyId: companyId, // Security check
          },
          data: updateData,
        }),
      ),
    );

    return NextResponse.json({ count: results.length });
  } catch (error) {
    console.error("PATCH_LEAD_ERROR", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
