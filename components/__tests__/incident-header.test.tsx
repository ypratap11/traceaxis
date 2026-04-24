import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { IncidentHeader } from "@/components/replay/incident-header";

const incident = {
  id: "INC-2384",
  title: "Planner timeout led to mission abort in aisle M-14",
  detectedAt: "04:12.380",
  robot: "amr-014",
  site: "Phoenix DC",
  softwareVersion: "v2.4.1",
  duration: "12.91 s",
  severity: "high" as const,
  failureType: "localization drift"
};

describe("IncidentHeader", () => {
  it("renders the title and id", () => {
    render(<IncidentHeader incident={incident} />);
    expect(screen.getByText(incident.title)).toBeInTheDocument();
    expect(screen.getByText(/INC-2384/)).toBeInTheDocument();
  });

  it("renders the severity badge for the failure type", () => {
    render(<IncidentHeader incident={incident} />);
    expect(screen.getByText("localization drift")).toBeInTheDocument();
  });

  it("renders robot, site, version, duration as tags", () => {
    render(<IncidentHeader incident={incident} />);
    expect(screen.getByText("amr-014")).toBeInTheDocument();
    expect(screen.getByText("Phoenix DC")).toBeInTheDocument();
    expect(screen.getByText("v2.4.1")).toBeInTheDocument();
    expect(screen.getByText("12.91 s")).toBeInTheDocument();
  });
});
