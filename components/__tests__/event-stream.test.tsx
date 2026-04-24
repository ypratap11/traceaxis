import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventStream } from "@/components/replay/event-stream";

const events = [
  { id: "a", label: "Mission start", ms: 0, severity: "info" as const },
  { id: "b", label: "Drift", ms: 6000, severity: "warn" as const },
  { id: "c", label: "Abort", ms: 12000, severity: "err" as const }
];

describe("EventStream", () => {
  it("renders one row per event", () => {
    render(<EventStream events={events} currentMs={0} onSeek={() => {}} />);
    expect(screen.getByText("Mission start")).toBeInTheDocument();
    expect(screen.getByText("Drift")).toBeInTheDocument();
    expect(screen.getByText("Abort")).toBeInTheDocument();
  });

  it("marks the row at or before the cursor as active", () => {
    render(<EventStream events={events} currentMs={7000} onSeek={() => {}} />);
    const driftRow = screen.getByRole("button", { name: /Drift/ });
    expect(driftRow.className).toMatch(/border-l-bloom/);
  });

  it("calls onSeek with the row's ms when clicked", async () => {
    const user = userEvent.setup();
    const onSeek = vi.fn();
    render(<EventStream events={events} currentMs={0} onSeek={onSeek} />);
    await user.click(screen.getByRole("button", { name: /Abort/ }));
    expect(onSeek).toHaveBeenCalledWith(12000);
  });

  it("renders the count summary in the header", () => {
    render(<EventStream events={events} currentMs={0} onSeek={() => {}} />);
    expect(screen.getByText(/3 events/)).toBeInTheDocument();
  });
});
