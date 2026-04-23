export type IncidentStatus = "new" | "investigating" | "resolved";
export type IncidentSeverity = "critical" | "high" | "medium" | "low";

export type Incident = {
  id: string;
  title: string;
  robot: string;
  site: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  failureType: string;
  detectedAt: string;
  softwareVersion: string;
  duration: string;
  summary: string;
};

export type EventMarker = {
  id: string;
  label: string;
  timestamp: string;
  tone: "danger" | "warning" | "info" | "accent";
};

export type TimelineSignal = {
  label: string;
  values: number[];
  color: string;
};

export type Note = {
  id: string;
  author: string;
  timestamp: string;
  body: string;
};

export type UploadJob = {
  id: string;
  sourceName: string;
  robot: string;
  site: string;
  failureType: string;
  status: "queued" | "processing" | "ready" | "failed";
  createdAt: string;
  incidentId?: string;
};
