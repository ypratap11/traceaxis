import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InboxBody } from "@/components/inbox/inbox-body";
import type { Incident } from "@/lib/types";

const incidents: Incident[] = [
  {
    id: "a",
    title: "Localization drift",
    robot: "AX-17",
    site: "Phoenix DC",
    severity: "critical",
    status: "investigating",
    failureType: "Localization Loss",
    detectedAt: "2026-04-22 19:42",
    softwareVersion: "v0.9.14",
    duration: "09m 14s",
    summary: "x"
  },
  {
    id: "b",
    title: "Battery sag",
    robot: "AX-04",
    site: "Long Beach",
    severity: "high",
    status: "new",
    failureType: "Battery Sag",
    detectedAt: "2026-04-22 08:15",
    softwareVersion: "v0.9.14",
    duration: "04m 49s",
    summary: "y"
  },
  {
    id: "c",
    title: "Network disconnect",
    robot: "AX-21",
    site: "Seattle",
    severity: "medium",
    status: "resolved",
    failureType: "Network Disconnect",
    detectedAt: "2026-04-21 13:07",
    softwareVersion: "v0.9.13",
    duration: "06m 01s",
    summary: "z"
  }
];

describe("InboxBody", () => {
  it("renders all incidents by default", () => {
    render(<InboxBody incidents={incidents} />);
    expect(screen.getByText("Localization drift")).toBeInTheDocument();
    expect(screen.getByText("Battery sag")).toBeInTheDocument();
    expect(screen.getByText("Network disconnect")).toBeInTheDocument();
  });

  it("filters by severity when a severity pill is toggled", async () => {
    const user = userEvent.setup();
    render(<InboxBody incidents={incidents} />);
    await user.click(screen.getByRole("button", { name: "Critical" }));
    expect(screen.getByText("Localization drift")).toBeInTheDocument();
    expect(screen.queryByText("Battery sag")).toBeNull();
    expect(screen.queryByText("Network disconnect")).toBeNull();
  });

  it("filters by status when a status pill is toggled", async () => {
    const user = userEvent.setup();
    render(<InboxBody incidents={incidents} />);
    await user.click(screen.getByRole("button", { name: "New" }));
    expect(screen.getByText("Battery sag")).toBeInTheDocument();
    expect(screen.queryByText("Localization drift")).toBeNull();
  });

  it("combines filters with AND (severity AND status)", async () => {
    const user = userEvent.setup();
    render(<InboxBody incidents={incidents} />);
    await user.click(screen.getByRole("button", { name: "High" }));
    await user.click(screen.getByRole("button", { name: "New" }));
    expect(screen.getByText("Battery sag")).toBeInTheDocument();
    expect(screen.queryByText("Localization drift")).toBeNull();
    expect(screen.queryByText("Network disconnect")).toBeNull();
  });

  it("renders today metric tiles in the right rail", () => {
    render(<InboxBody incidents={incidents} />);
    expect(screen.getByText(/new incidents/i)).toBeInTheDocument();
    expect(screen.getByText(/investigating/i)).toBeInTheDocument();
  });

  it("shows an empty state when filters match no incidents", async () => {
    const user = userEvent.setup();
    render(<InboxBody incidents={incidents} />);
    await user.click(screen.getByRole("button", { name: "Low" }));
    expect(screen.getByText(/no incidents match/i)).toBeInTheDocument();
  });
});
