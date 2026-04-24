import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScrubberHero } from "@/components/marketing/scrubber-hero";

const events = [
  { id: "a", label: "Mission start", ms: 0, severity: "info" as const },
  { id: "b", label: "Drift", ms: 6000, severity: "warn" as const },
  { id: "c", label: "Abort", ms: 12000, severity: "err" as const }
];

describe("ScrubberHero", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders a Scrubber with the provided events", () => {
    render(<ScrubberHero events={events} durationMs={12910} />);
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("auto-advances the cursor when autoPlay is true (default)", () => {
    render(<ScrubberHero events={events} durationMs={12910} />);
    const slider = screen.getByRole("slider");
    const before = Number(slider.getAttribute("aria-valuenow"));
    act(() => {
      vi.advanceTimersByTime(500);
    });
    const after = Number(slider.getAttribute("aria-valuenow"));
    expect(after).toBeGreaterThan(before);
  });

  it("loops the cursor back to 0 after reaching duration", () => {
    render(
      <ScrubberHero events={events} durationMs={1000} initialMs={950} />
    );
    act(() => {
      vi.advanceTimersByTime(500);
    });
    const slider = screen.getByRole("slider");
    const value = Number(slider.getAttribute("aria-valuenow"));
    expect(value).toBeLessThan(950);
  });

  it("does not auto-advance when autoPlay is false", () => {
    render(
      <ScrubberHero events={events} durationMs={12910} autoPlay={false} />
    );
    const slider = screen.getByRole("slider");
    const before = Number(slider.getAttribute("aria-valuenow"));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    const after = Number(slider.getAttribute("aria-valuenow"));
    expect(after).toBe(before);
  });

  it("pauses when the user clicks pause", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ScrubberHero events={events} durationMs={12910} />);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    const slider = screen.getByRole("slider");
    const afterPlay = Number(slider.getAttribute("aria-valuenow"));
    await user.click(screen.getByRole("button", { name: /pause/i }));
    act(() => {
      vi.advanceTimersByTime(500);
    });
    const afterPause = Number(slider.getAttribute("aria-valuenow"));
    expect(afterPause).toBe(afterPlay);
  });
});
