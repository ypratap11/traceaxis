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

  it("calls onSeek once with the clicked event timestamp (stopPropagation)", async () => {
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
    expect(onSeek).toHaveBeenCalledOnce();
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
    await user.click(screen.getByRole("button", { name: /^play$/i }));
    expect(onPlayToggle).toHaveBeenCalledOnce();
  });

  it("renders the pause label when isPlaying=true", () => {
    render(
      <Scrubber
        events={events}
        currentMs={0}
        durationMs={12910}
        onSeek={() => {}}
        isPlaying
      />
    );
    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^play$/i })
    ).not.toBeInTheDocument();
  });

  it("seeks when the track itself is clicked", () => {
    const onSeek = vi.fn();
    render(
      <Scrubber
        events={events}
        currentMs={0}
        durationMs={10000}
        onSeek={onSeek}
      />
    );
    const track = screen.getByRole("slider");
    Object.defineProperty(track, "getBoundingClientRect", {
      value: () => ({ left: 0, width: 200, top: 0, height: 36 }),
      configurable: true
    });
    fireEvent.click(track, { clientX: 100 });
    expect(onSeek).toHaveBeenCalledWith(5000);
  });

  it("clamps prev to zero at the start of the timeline", async () => {
    const user = userEvent.setup();
    const onSeek = vi.fn();
    render(
      <Scrubber
        events={events}
        currentMs={500}
        durationMs={10000}
        onSeek={onSeek}
      />
    );
    await user.click(screen.getByRole("button", { name: /previous/i }));
    expect(onSeek).toHaveBeenCalledWith(0);
  });

  it("clamps next to duration at the end of the timeline", async () => {
    const user = userEvent.setup();
    const onSeek = vi.fn();
    render(
      <Scrubber
        events={events}
        currentMs={9500}
        durationMs={10000}
        onSeek={onSeek}
      />
    );
    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(onSeek).toHaveBeenCalledWith(10000);
  });

  it("seeks via keyboard arrows on the slider", () => {
    const onSeek = vi.fn();
    render(
      <Scrubber
        events={events}
        currentMs={5000}
        durationMs={10000}
        onSeek={onSeek}
      />
    );
    const track = screen.getByRole("slider");
    fireEvent.keyDown(track, { key: "ArrowRight" });
    expect(onSeek).toHaveBeenLastCalledWith(5100);
    fireEvent.keyDown(track, { key: "ArrowLeft" });
    expect(onSeek).toHaveBeenLastCalledWith(4900);
    fireEvent.keyDown(track, { key: "Home" });
    expect(onSeek).toHaveBeenLastCalledWith(0);
    fireEvent.keyDown(track, { key: "End" });
    expect(onSeek).toHaveBeenLastCalledWith(10000);
  });

  it("does not produce NaN when durationMs is 0", () => {
    const { container } = render(
      <Scrubber
        events={[]}
        currentMs={0}
        durationMs={0}
        onSeek={() => {}}
      />
    );
    expect(container.innerHTML).not.toMatch(/NaN/);
    expect(container.innerHTML).not.toMatch(/Infinity/);
  });

  it("exposes slider aria value attributes", () => {
    render(
      <Scrubber
        events={events}
        currentMs={4500}
        durationMs={10000}
        onSeek={() => {}}
      />
    );
    const track = screen.getByRole("slider");
    expect(track).toHaveAttribute("aria-valuemin", "0");
    expect(track).toHaveAttribute("aria-valuemax", "10000");
    expect(track).toHaveAttribute("aria-valuenow", "4500");
  });
});
