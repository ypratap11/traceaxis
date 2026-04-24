import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CompareBody } from "@/components/compare/compare-body";
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

describe("CompareBody", () => {
  it("renders the diff strip, both sides, and the shared scrubber", () => {
    render(<CompareBody incident={incident} />);
    // Only the DiffStrip has "Localization confidence" (sparklines use
    // "Localization Confidence" with capital C — different text via CSS
    // would match, but getByText is case-sensitive by default).
    expect(screen.getByText("Localization confidence")).toBeInTheDocument();
    // Two video panes.
    expect(screen.getAllByLabelText(/play preview/i).length).toBe(2);
    // Panel eyebrows label the sides.
    expect(screen.getByText("Failed run")).toBeInTheDocument();
    expect(screen.getByText("Baseline")).toBeInTheDocument();
    // Single shared scrubber.
    expect(screen.getAllByRole("slider").length).toBe(1);
  });

  it("clicking a failed-run event row moves the shared scrubber", async () => {
    const user = userEvent.setup();
    render(<CompareBody incident={incident} />);
    const slider = screen.getByRole("slider");
    const before = slider.getAttribute("aria-valuenow");

    // Scope to the FAILED side explicitly via data-testid.
    const failedSide = screen.getByTestId("compare-side-failed");
    const rows = within(failedSide).getAllByRole("button");
    // Filter to just event-stream rows (they have timestamps in them —
    // format MM:SS.mmm). Scrubber controls and markers exist too but
    // are outside this section.
    const eventRows = rows.filter((btn) =>
      /\d{2}:\d{2}\.\d{3}/.test(btn.textContent ?? "")
    );
    expect(eventRows.length).toBeGreaterThan(1);

    await user.click(eventRows[1]);

    const after = slider.getAttribute("aria-valuenow");
    expect(after).not.toBe(before);
  });
});
