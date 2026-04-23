import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { Incident, UploadJob } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");
const incidentsPath = path.join(dataDir, "incidents.json");
const uploadsPath = path.join(dataDir, "uploads.json");

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

async function writeJsonFile<T>(filePath: string, value: T) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function listIncidents() {
  const incidents = await readJsonFile<Incident[]>(incidentsPath);
  return incidents.sort((a, b) => b.detectedAt.localeCompare(a.detectedAt));
}

export async function getIncident(incidentId: string) {
  const incidents = await listIncidents();
  return incidents.find((incident) => incident.id === incidentId) ?? null;
}

export async function listUploads() {
  const uploads = await readJsonFile<UploadJob[]>(uploadsPath);
  return uploads.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

type CreateUploadInput = {
  title: string;
  robot: string;
  site: string;
  failureType: string;
  sourceName: string;
  softwareVersion?: string;
};

export async function createUploadAndIncident(input: CreateUploadInput) {
  const [incidents, uploads] = await Promise.all([listIncidents(), listUploads()]);
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");
  const incidentId = `inc_${randomUUID().slice(0, 8)}`;

  const incident: Incident = {
    id: incidentId,
    title: input.title,
    robot: input.robot,
    site: input.site,
    severity: "medium",
    status: "new",
    failureType: input.failureType,
    detectedAt: now,
    softwareVersion: input.softwareVersion?.trim() || "v0.1.0",
    duration: "Pending parse",
    summary: `Created from uploaded source ${input.sourceName}. Ingestion and event extraction are still pending.`
  };

  const upload: UploadJob = {
    id: `upl_${randomUUID().slice(0, 8)}`,
    sourceName: input.sourceName,
    robot: input.robot,
    site: input.site,
    failureType: input.failureType,
    status: "ready",
    createdAt: now,
    incidentId
  };

  await Promise.all([
    writeJsonFile(incidentsPath, [incident, ...incidents]),
    writeJsonFile(uploadsPath, [upload, ...uploads])
  ]);

  return { incident, upload };
}
