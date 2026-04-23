import { NextResponse } from "next/server";
import { listIncidents } from "@/lib/store";

export async function GET() {
  const incidents = await listIncidents();
  return NextResponse.json({ incidents });
}
