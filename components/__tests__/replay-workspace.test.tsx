import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReplayWorkspace } from "@/components/replay-workspace";
import type { Incident } from "@/lib/types";

const incident: Incident = {
  id: "inc_demo",
  title: "Demo incident",
  robot: "AX-99",
  site: "Demo Site",
  severity: "high",
  status: "investigating",
  failureType: "Localization Loss",
  detectedAt: "2026-04-22 19:42",
  softwareVersion: "v0.9.14",
  duration: "12.91 s",
  summary: "Demo summary."
};

describe("ReplayWorkspace", () => {
  it("renders the incident header, video pane, event stream, telemetry row, topic inspector, robot state, and scrubber", () => {
    render(<ReplayWorkspace incident={incident} />);
    expect(screen.getByText("Demo incident")).toBeInTheDocument(); // header
    expect(screen.getByLabelText(/play preview/i)).toBeInTheDocument(); // video pane
    expect(screen.getByText(/events/)).toBeInTheDocument(); // event stream header
    expect(screen.getByText(/cmd_vel/i)).toBeInTheDocument(); // telemetry row (label)
    expect(screen.getByPlaceholderText(/search topics/i)).toBeInTheDocument(); // inspector
    expect(screen.getByText(/Robot state/i)).toBeInTheDocument(); // state grid
    expect(screen.getByRole("slider")).toBeInTheDocument(); // scrubber
  });

  it("clicking an event row updates the scrubber cursor", async () => {
    const user = userEvent.setup();
    render(<ReplayWorkspace incident={incident} />);
    const before = screen.getByRole("slider").getAttribute("aria-valuenow");
    // Click an event row — the seed data includes "Localization drift begins"
    const row = screen.getByRole("button", { name: /Localization drift begins/i });
    await user.click(row);
    const after = screen.getByRole("slider").getAttribute("aria-valuenow");
    expect(after).not.toBe(before);
  });
});
