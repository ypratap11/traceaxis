import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReplayProvider, useReplay } from "@/components/replay/replay-context";

const sampleEvents = [
  { id: "a", label: "Start", ms: 0, severity: "info" as const },
  { id: "b", label: "Drift", ms: 6000, severity: "warn" as const }
];

function Probe() {
  const { currentMs, durationMs, isPlaying, seek, togglePlay } = useReplay();
  return (
    <div>
      <span data-testid="current">{currentMs}</span>
      <span data-testid="duration">{durationMs}</span>
      <span data-testid="playing">{String(isPlaying)}</span>
      <button onClick={() => seek(3000)}>seek</button>
      <button onClick={togglePlay}>toggle</button>
    </div>
  );
}

describe("ReplayProvider", () => {
  it("seeds the cursor at the initialMs and exposes the durationMs", () => {
    render(
      <ReplayProvider events={sampleEvents} durationMs={10000} initialMs={1500}>
        <Probe />
      </ReplayProvider>
    );
    expect(screen.getByTestId("current")).toHaveTextContent("1500");
    expect(screen.getByTestId("duration")).toHaveTextContent("10000");
    expect(screen.getByTestId("playing")).toHaveTextContent("false");
  });

  it("seek updates the cursor", async () => {
    const user = userEvent.setup();
    render(
      <ReplayProvider events={sampleEvents} durationMs={10000}>
        <Probe />
      </ReplayProvider>
    );
    await user.click(screen.getByText("seek"));
    expect(screen.getByTestId("current")).toHaveTextContent("3000");
  });

  it("seek clamps to [0, durationMs]", async () => {
    const user = userEvent.setup();
    function ClampProbe() {
      const { currentMs, seek } = useReplay();
      return (
        <div>
          <span data-testid="current">{currentMs}</span>
          <button onClick={() => seek(-100)}>under</button>
          <button onClick={() => seek(99999)}>over</button>
        </div>
      );
    }
    render(
      <ReplayProvider events={sampleEvents} durationMs={10000}>
        <ClampProbe />
      </ReplayProvider>
    );
    await user.click(screen.getByText("under"));
    expect(screen.getByTestId("current")).toHaveTextContent("0");
    await user.click(screen.getByText("over"));
    expect(screen.getByTestId("current")).toHaveTextContent("10000");
  });

  it("togglePlay flips isPlaying", async () => {
    const user = userEvent.setup();
    render(
      <ReplayProvider events={sampleEvents} durationMs={10000}>
        <Probe />
      </ReplayProvider>
    );
    await user.click(screen.getByText("toggle"));
    expect(screen.getByTestId("playing")).toHaveTextContent("true");
    await user.click(screen.getByText("toggle"));
    expect(screen.getByTestId("playing")).toHaveTextContent("false");
  });

  it("useReplay throws outside of a provider", () => {
    function Orphan() {
      useReplay();
      return null;
    }
    expect(() => render(<Orphan />)).toThrow(/ReplayProvider/);
  });
});
