import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sparkline } from "@/components/primitives/sparkline";

const sampleValues = [1, 2, 3, 4, 5, 6, 7, 8];

describe("Sparkline", () => {
  it("renders label and current value", () => {
    render(
      <Sparkline label="cmd_vel" values={sampleValues} cursorIndex={4} />
    );
    expect(screen.getByText("cmd_vel")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders a unit when provided", () => {
    render(
      <Sparkline
        label="battery"
        values={sampleValues}
        cursorIndex={0}
        unit="V"
      />
    );
    expect(screen.getByText("V")).toBeInTheDocument();
  });

  it("renders a delta when provided", () => {
    render(
      <Sparkline
        label="x"
        values={sampleValues}
        cursorIndex={0}
        delta="↓ 0.08"
      />
    );
    expect(screen.getByText("↓ 0.08")).toBeInTheDocument();
  });

  it("renders an SVG path for the line", () => {
    const { container } = render(
      <Sparkline label="x" values={sampleValues} cursorIndex={0} />
    );
    expect(container.querySelector("svg path")).toBeTruthy();
  });
});
