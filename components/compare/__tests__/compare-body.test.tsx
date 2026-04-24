import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
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
    const { container } = render(<CompareBody incident={incident} />);
    expect(screen.getByText(/Localization confidence/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/play preview/i).length).toBe(2);
    expect(screen.getByText(/Failed run/i)).toBeInTheDocument();
    expect(screen.getByText(/Baseline/i)).toBeInTheDocument();
    expect(screen.getAllByRole("slider").length).toBe(1);
    expect(container.querySelectorAll("svg").length).toBeGreaterThanOrEqual(6);
  });

  it("clicking a failed-run event row moves the shared scrubber", async () => {
    const user = userEvent.setup();
    const { container } = render(<CompareBody incident={incident} />);
    const slider = screen.getByRole("slider");
    const before = slider.getAttribute("aria-valuenow");

    const uls = container.querySelectorAll("ul");
    expect(uls.length).toBeGreaterThanOrEqual(2);
    const failedUl = uls[0] as HTMLElement;
    const rows = failedUl.querySelectorAll("button");
    expect(rows.length).toBeGreaterThan(1);

    await user.click(rows[1]);
    const after = slider.getAttribute("aria-valuenow");
    expect(after).not.toBe(before);
  });
});
