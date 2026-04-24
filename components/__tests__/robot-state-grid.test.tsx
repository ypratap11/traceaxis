import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RobotStateGrid } from "@/components/replay/robot-state-grid";

const cells = [
  { k: "mode", v: "autonomous" },
  { k: "planner", v: "timeout" },
  { k: "x", v: "14.382" },
  { k: "y", v: "-3.114" }
];

describe("RobotStateGrid", () => {
  it("renders one cell per item", () => {
    render(<RobotStateGrid cells={cells} />);
    expect(screen.getByText("autonomous")).toBeInTheDocument();
    expect(screen.getByText("timeout")).toBeInTheDocument();
    expect(screen.getByText("14.382")).toBeInTheDocument();
    expect(screen.getByText("-3.114")).toBeInTheDocument();
  });

  it("renders keys in uppercase eyebrow style", () => {
    render(<RobotStateGrid cells={cells} />);
    expect(screen.getByText("mode").className).toMatch(/uppercase/);
  });
});
