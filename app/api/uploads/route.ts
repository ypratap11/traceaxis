import { NextResponse } from "next/server";
import { createUploadAndIncident, listUploads } from "@/lib/store";

export async function GET() {
  const uploads = await listUploads();
  return NextResponse.json({ uploads });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  let payload: Record<string, string>;

  if (contentType.includes("application/json")) {
    payload = await request.json();
  } else {
    const formData = await request.formData();
    payload = Object.fromEntries(
      Array.from(formData.entries()).map(([key, value]) => [key, String(value)])
    );
  }

  const title = payload.title?.trim();
  const robot = payload.robot?.trim();
  const site = payload.site?.trim();
  const failureType = payload.failureType?.trim();
  const sourceName = payload.sourceName?.trim();

  if (!title || !robot || !site || !failureType || !sourceName) {
    return NextResponse.json(
      { error: "title, robot, site, failureType, and sourceName are required" },
      { status: 400 }
    );
  }

  const created = await createUploadAndIncident({
    title,
    robot,
    site,
    failureType,
    sourceName,
    softwareVersion: payload.softwareVersion
  });

  const acceptsHtml = (request.headers.get("accept") ?? "").includes("text/html");
  if (acceptsHtml) {
    return NextResponse.redirect(
      new URL(`/app/incidents/${created.incident.id}`, request.url),
      { status: 303 }
    );
  }

  return NextResponse.json(created, { status: 201 });
}
