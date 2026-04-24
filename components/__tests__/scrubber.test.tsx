import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Scrubber } from "@/components/primitives/scrubber";

const events = [
  { id: "a", label: "Mission start", ms: 0, severity: "info" as const },
  { id: "b", label: "Localization drop", ms: 9220, severity: "warn" as const },
  { id: "c", label: "Planner timeout", ms: 12380, severity: "err" as const }
];

describe("Scrubber", () => {
  it("renders the cursor timestamp", () => {
    render(
      <Scrubber
        events={events}
        currentMs={12380}
        durationMs={12910}
        onSeek={() => {}}
      />
    );
    expect(screen.getByText(/T\+/)).toBeInTheDocument();
  });

  it("renders a marker per event with severity color", () => {
    const { container } = render(
      <Scrubber
        events={events}
        currentMs={0}
        durationMs={12910}
        onSeek={() => {}}
      />
    );
    expect(container.querySelectorAll("[data-event-marker]").length).toBe(3);
    expect(container.querySelector("[data-severity='err']")).toBeTruthy();
  });

  it("calls onSeek with the clicked event timestamp", async () => {
    const user = userEvent.setup();
    const onSeek = vi.fn();
    render(
      <Scrubber
        events={events}
        currentMs={0}
        durationMs={12910}
        onSeek={onSeek}
      />
    );
    await user.click(
      screen.getByRole("button", { name: /Localization drop/i })
    );
    expect(onSeek).toHaveBeenCalledWith(9220);
  });

  it("calls onPlayToggle when play is clicked", async () => {
    const user = userEvent.setup();
    const onPlayToggle = vi.fn();
    render(
      <Scrubber
        events={events}
        currentMs={0}
        durationMs={12910}
        onSeek={() => {}}
        onPlayToggle={onPlayToggle}
      />
    );
    await user.click(screen.getByRole("button", { name: /play/i }));
    expect(onPlayToggle).toHaveBeenCalledOnce();
  });

  it("seeks when the track itself is clicked", () => {
    const onSeek = vi.fn();
    const { container } = render(
      <Scrubber
        events={events}
        currentMs={0}
        durationMs={10000}
        onSeek={onSeek}
      />
    );
    const track = container.querySelector("[data-scrub-track]") as HTMLElement;
    Object.defineProperty(track, "getBoundingClientRect", {
      value: () => ({ left: 0, width: 200, top: 0, height: 36 }),
      configurable: true
    });
    fireEvent.click(track, { clientX: 100 });
    expect(onSeek).toHaveBeenCalledWith(5000);
  });
});
