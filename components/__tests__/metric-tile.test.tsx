import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MetricTile } from "@/components/primitives/metric-tile";

describe("MetricTile", () => {
  it("renders label and value", () => {
    render(<MetricTile label="Active investigations" value="03" />);
    expect(screen.getByText("Active investigations")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
  });

  it("renders unit suffix when provided", () => {
    render(<MetricTile label="Battery" value="23.4" unit="V" />);
    expect(screen.getByText("V")).toBeInTheDocument();
  });

  it("renders delta with up direction in ok color", () => {
    render(
      <MetricTile
        label="x"
        value="1"
        delta="↑ 1 vs yesterday"
        deltaDirection="up"
      />
    );
    expect(screen.getByText("↑ 1 vs yesterday")).toHaveClass("text-ok");
  });

  it("renders delta with down direction in err color", () => {
    render(
      <MetricTile label="x" value="1" delta="↓ 4m" deltaDirection="down" />
    );
    expect(screen.getByText("↓ 4m")).toHaveClass("text-err");
  });

  it("renders delta with stable direction in muted color", () => {
    render(
      <MetricTile label="x" value="1" delta="stable" deltaDirection="stable" />
    );
    expect(screen.getByText("stable")).toHaveClass("text-ink-3");
  });
});
