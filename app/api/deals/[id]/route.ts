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

  console.log("Fetching deal with ID:", id, "for company:", companyId);

  if (!id || !companyId) {
    return NextResponse.json(
      { error: "Missing ID or Company ID" },
      { status: 400 },
    );
  }

  const deal = await prisma.deal.findFirst({
    where: {
      id: id,
      companyId: companyId,
    },
    include: { services: true, user: true },
  });

  if (!deal) {
    return NextResponse.json({ error: "deal not found" }, { status: 404 });
  }

  return NextResponse.json(deal);
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

  if (!routeId || routeId === "undefined" || !companyId) {
    return NextResponse.json(
      { error: "Missing ID or Company ID" },
      { status: 400 },
    );
  }

  console.log(
    "Updating deal with:",

    body,
  );
  try {
    const result = await prisma.$transaction(
      ids.map((id) =>
        prisma.deal.update({
          where: {
            id,
            companyId: companyId as string,
          },
          data: {
            title: body.title,
            value: body.value,
            stage: body.stage,
            assignedTo: body.assignedTo,
            customerId: body.customerId,
            expectedCloseDate: body.expectedCloseDate
              ? new Date(body.expectedCloseDate)
              : null,
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
    const result = await prisma.deal.deleteMany({
      where: {
        id: { in: ids },
        companyId: companyId as string,
      },
    });

    return NextResponse.json({
      message: `Deleted ${result.count} deals`,
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
    const { stage, serviceIds } = body;
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    const ids = routeId.split(",");

    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 },
      );
    }

    const updateData: any = {};
    if (stage !== undefined) updateData.stage = stage;
    if (serviceIds !== undefined) {
      updateData.services = {
        set: serviceIds.map((id: string) => ({ id })),
      };
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update" },
        { status: 400 },
      );
    }

    const results = await Promise.all(
      ids.map((id) =>
        prisma.deal.update({
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
    console.error("PATCH_DEAL_ERROR", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
