import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TelemetryRow } from "@/components/replay/telemetry-row";

const signals = [
  {
    label: "cmd_vel.linear_x",
    unit: "m/s",
    values: [0.8, 0.7, 0.6, 0.5, 0.4]
  },
  {
    label: "localization confidence",
    values: [0.92, 0.85, 0.7, 0.62, 0.51]
  },
  {
    label: "battery voltage",
    unit: "V",
    values: [23.6, 23.5, 23.4, 23.4, 23.3]
  }
];

describe("TelemetryRow", () => {
  it("renders one tile per signal", () => {
    render(<TelemetryRow signals={signals} cursorRatio={0} />);
    expect(screen.getByText("cmd_vel.linear_x")).toBeInTheDocument();
    expect(screen.getByText("localization confidence")).toBeInTheDocument();
    expect(screen.getByText("battery voltage")).toBeInTheDocument();
  });

  it("renders the value at the cursor ratio for each signal", () => {
    render(<TelemetryRow signals={signals} cursorRatio={1} />);
    expect(screen.getByText("0.4")).toBeInTheDocument();
    expect(screen.getByText("0.51")).toBeInTheDocument();
    expect(screen.getByText("23.3")).toBeInTheDocument();
  });
});
