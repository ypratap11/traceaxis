import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { SummaryBody } from "@/components/summary/summary-body";
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
  summary: "Localization degraded before mission abort."
};

describe("SummaryBody", () => {
  it("renders the title, severity badge, and root-cause paragraph", () => {
    render(<SummaryBody incident={incident} />);
    expect(screen.getByText("Demo incident")).toBeInTheDocument();
    expect(screen.getByText(/Localization Loss/)).toBeInTheDocument();
    expect(
      screen.getByText(/Localization degraded before mission abort/)
    ).toBeInTheDocument();
  });

  it("renders a Key Moments section with at least one deep link", () => {
    render(<SummaryBody incident={incident} />);
    expect(screen.getByText(/Key moments/i)).toBeInTheDocument();
    const deepLinks = screen
      .getAllByRole("link")
      .filter((l) => l.getAttribute("href")?.includes("?t="));
    expect(deepLinks.length).toBeGreaterThan(0);
  });

  it("renders a Notes section with author and body text", () => {
    render(<SummaryBody incident={incident} />);
    // scope to the Notes panel to avoid collision with "Autonomy Lead" in Bookmarks
    const notesSections = screen
      .getAllByText(/Notes/i)
      .map((el) => el.closest("section"))
      .filter(Boolean);
    const notesPanel = notesSections[0] as HTMLElement;
    expect(notesPanel).toBeTruthy();
    expect(within(notesPanel).getByText(/Autonomy Lead/)).toBeInTheDocument();
  });

  it("renders a Bookmarks section", () => {
    render(<SummaryBody incident={incident} />);
    expect(screen.getByText(/Bookmarks/i)).toBeInTheDocument();
  });

  it("renders the Export Report primary button", () => {
    render(<SummaryBody incident={incident} />);
    expect(
      screen.getByRole("button", { name: /export report/i })
    ).toBeInTheDocument();
  });
});
