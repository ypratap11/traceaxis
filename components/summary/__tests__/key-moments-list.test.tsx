import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KeyMomentsList } from "@/components/summary/key-moments-list";

const events = [
  { id: "a", label: "Localization drift begins", ms: 6000, severity: "warn" as const },
  { id: "b", label: "Mission abort", ms: 12000, severity: "err" as const }
];

describe("KeyMomentsList", () => {
  it("renders one clickable row per event", () => {
    render(<KeyMomentsList incidentId="inc_demo" events={events} />);
    expect(screen.getByText("Localization drift begins")).toBeInTheDocument();
    expect(screen.getByText("Mission abort")).toBeInTheDocument();
  });

  it("links each row to the replay console with ?t=<ms>", () => {
    render(<KeyMomentsList incidentId="inc_demo" events={events} />);
    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute(
      "href",
      "/app/incidents/inc_demo?t=6000"
    );
    expect(links[1]).toHaveAttribute(
      "href",
      "/app/incidents/inc_demo?t=12000"
    );
  });

  it("shows severity dot color matching the severity", () => {
    const { container } = render(
      <KeyMomentsList incidentId="inc_demo" events={events} />
    );
    expect(container.querySelector(".bg-warn")).toBeTruthy();
    expect(container.querySelector(".bg-err")).toBeTruthy();
  });
});
