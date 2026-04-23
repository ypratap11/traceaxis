import { NextResponse } from "next/server";
import { getIncident } from "@/lib/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ incidentId: string }> }
) {
  const { incidentId } = await params;
  const incident = await getIncident(incidentId);

  if (!incident) {
    return NextResponse.json({ error: "Incident not found" }, { status: 404 });
  }

  return NextResponse.json({ incident });
}
