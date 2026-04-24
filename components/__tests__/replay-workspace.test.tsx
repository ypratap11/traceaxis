import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
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
    expect(screen.getByText("Demo incident")).toBeInTheDocument();
    expect(screen.getByLabelText(/play preview/i)).toBeInTheDocument();
    expect(screen.getByRole("slider")).toBeInTheDocument();
    // EventStream header row (counts)
    expect(screen.getByText(/anomalies/i)).toBeInTheDocument();
    // Telemetry row
    expect(screen.getByText(/Localization Confidence/i)).toBeInTheDocument();
    // Topic inspector
    expect(screen.getByPlaceholderText(/search topics/i)).toBeInTheDocument();
    // Robot state grid
    expect(screen.getByText(/Robot state/i)).toBeInTheDocument();
  });

  it("clicking an event row updates the scrubber cursor", async () => {
    const user = userEvent.setup();
    const { container } = render(<ReplayWorkspace incident={incident} />);
    const slider = screen.getByRole("slider");
    const before = slider.getAttribute("aria-valuenow");

    // Scope to the EventStream's <ul> list (panel body) to avoid the
    // scrubber-marker button with the same aria-label.
    const ul = container.querySelector("ul");
    expect(ul).not.toBeNull();
    const row = within(ul as HTMLElement).getByRole("button", {
      name: /Localization drift begins/i
    });
    await user.click(row);

    const after = slider.getAttribute("aria-valuenow");
    expect(after).not.toBe(before);
  });

  it("the scrubber renders event markers alongside the event stream", () => {
    const { container } = render(<ReplayWorkspace incident={incident} />);
    // There are 4 event markers in the seed data. Scrubber renders one
    // <button data-event-marker> per event. The EventStream renders its
    // rows as nested <button>s inside <li> inside a <ul>.
    const markers = container.querySelectorAll("[data-event-marker]");
    expect(markers.length).toBeGreaterThan(0);
  });
});
