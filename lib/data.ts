import { EventMarker, Incident, Note, TimelineSignal } from "@/lib/types";

export const incidents: Incident[] = [
  {
    id: "inc_0423_localization",
    title: "Localization drift before aisle merge",
    robot: "AX-17",
    site: "Phoenix DC",
    severity: "critical",
    status: "investigating",
    failureType: "Localization Loss",
    detectedAt: "2026-04-22 19:42",
    softwareVersion: "v0.9.14",
    duration: "09m 14s",
    summary:
      "Pose confidence degraded during a congested merge. Planner entered recovery, then mission aborted."
  },
  {
    id: "inc_0422_docking",
    title: "Docking abort after battery sag",
    robot: "AX-04",
    site: "Long Beach Lab",
    severity: "high",
    status: "new",
    failureType: "Battery Sag",
    detectedAt: "2026-04-22 08:15",
    softwareVersion: "v0.9.14",
    duration: "04m 49s",
    summary:
      "Voltage drop triggered a safety rollback during docking. Recovery succeeded on second attempt."
  },
  {
    id: "inc_0421_network",
    title: "Mission timeout after network disconnect",
    robot: "AX-21",
    site: "Seattle Test Floor",
    severity: "medium",
    status: "resolved",
    failureType: "Network Disconnect",
    detectedAt: "2026-04-21 13:07",
    softwareVersion: "v0.9.13",
    duration: "06m 01s",
    summary:
      "Telemetry dropped for 14 seconds during route update and mission state machine timed out."
  }
];

export const eventMarkers: EventMarker[] = [
  {
    id: "event_1",
    label: "Localization drift begins",
    timestamp: "06:12",
    tone: "warning"
  },
  {
    id: "event_2",
    label: "Planner recovery engaged",
    timestamp: "06:37",
    tone: "info"
  },
  {
    id: "event_3",
    label: "Mission abort",
    timestamp: "07:03",
    tone: "danger"
  },
  {
    id: "event_4",
    label: "Operator bookmark",
    timestamp: "07:11",
    tone: "accent"
  }
];

export const telemetrySignals: TimelineSignal[] = [
  {
    label: "Localization Confidence",
    color: "#4cf2c5",
    values: [92, 90, 88, 82, 80, 76, 64, 51, 43, 38, 32, 28]
  },
  {
    label: "Battery Voltage",
    color: "#67a7ff",
    values: [52, 52, 51, 51, 51, 50, 50, 49, 49, 49, 48, 48]
  },
  {
    label: "Velocity Command",
    color: "#f6b94f",
    values: [0, 0.4, 0.5, 0.8, 0.8, 0.7, 0.6, 0.2, 0, 0, 0, 0]
  }
];

export const compareDiffs = [
  "Localization drift increased at 06:12",
  "cmd_vel dropped 2.4s earlier than baseline",
  "Recovery loop lasted 11.8s longer than healthy run"
];

export const incidentNotes: Note[] = [
  {
    id: "note_1",
    author: "Autonomy Lead",
    timestamp: "2026-04-22 19:58",
    body:
      "Planner fallback triggered correctly, but localization confidence never recovered after forklift occlusion."
  },
  {
    id: "note_2",
    author: "Perception Engineer",
    timestamp: "2026-04-22 20:11",
    body:
      "Need to check whether April map refresh shifted the aisle landmark geometry near waypoint M-14."
  }
];

export const commandTrace = [
  { time: "06:05", label: "cmd_vel", value: "0.82 m/s", tone: "normal" },
  { time: "06:12", label: "pose_confidence", value: "0.51", tone: "warning" },
  { time: "06:28", label: "planner_mode", value: "recovery", tone: "info" },
  { time: "07:03", label: "mission_state", value: "abort", tone: "danger" }
];

export const inspectorTopics = [
  { name: "/localization/pose", detail: "421 msgs", state: "watch" },
  { name: "/planner/state", detail: "88 msgs", state: "watch" },
  { name: "/sensors/front_camera", detail: "video synced", state: "live" },
  { name: "/control/cmd_vel", detail: "127 msgs", state: "watch" }
];

export const replayBookmarks = [
  { title: "Forklift enters lane", time: "06:09", owner: "Ops Review" },
  { title: "Pose drops below threshold", time: "06:12", owner: "Autonomy Lead" },
  { title: "Mission abort decision", time: "07:03", owner: "Planner Team" }
];
