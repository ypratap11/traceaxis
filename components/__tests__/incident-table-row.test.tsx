import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { IncidentTableRow } from "@/components/primitives/incident-table-row";
import type { Incident } from "@/lib/types";

const incident: Incident = {
  id: "inc_demo",
  title: "Localization drift",
  robot: "AX-17",
  site: "Phoenix DC",
  severity: "high",
  status: "investigating",
  failureType: "Localization Loss",
  detectedAt: "2026-04-22 19:42",
  softwareVersion: "v0.9.14",
  duration: "09m 14s",
  summary: "Demo"
};

describe("IncidentTableRow", () => {
  it("renders the title, robot, site, version, time, and status", () => {
    render(<IncidentTableRow incident={incident} />);
    expect(screen.getByText("Localization drift")).toBeInTheDocument();
    expect(screen.getByText("AX-17")).toBeInTheDocument();
    expect(screen.getByText("Phoenix DC")).toBeInTheDocument();
    expect(screen.getByText("v0.9.14")).toBeInTheDocument();
    expect(screen.getByText("2026-04-22 19:42")).toBeInTheDocument();
    expect(screen.getByText("investigating")).toBeInTheDocument();
  });

  it("is a link to the incident detail page", () => {
    render(<IncidentTableRow incident={incident} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/app/incidents/inc_demo");
  });

  it("renders a severity dot in the err color for critical incidents", () => {
    const { container } = render(
      <IncidentTableRow
        incident={{ ...incident, severity: "critical" }}
      />
    );
    expect(container.querySelector("[data-severity-dot='critical']")).toHaveClass(
      "bg-err"
    );
  });
});
