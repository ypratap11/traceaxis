import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DiffStrip } from "@/components/primitives/diff-strip";

const diffs = [
  { label: "Localization confidence", delta: "-32%", worse: "left" as const },
  { label: "cmd_vel", delta: "dropped 0.4s earlier", worse: "left" as const },
  { label: "Battery", delta: "stable in both", worse: "none" as const }
];

describe("DiffStrip", () => {
  it("renders one chip per diff with label and delta", () => {
    render(<DiffStrip diffs={diffs} />);
    expect(screen.getByText("Localization confidence")).toBeInTheDocument();
    expect(screen.getByText("-32%")).toBeInTheDocument();
    expect(screen.getByText("cmd_vel")).toBeInTheDocument();
    expect(screen.getByText(/dropped 0.4s earlier/)).toBeInTheDocument();
    expect(screen.getByText("Battery")).toBeInTheDocument();
    expect(screen.getByText("stable in both")).toBeInTheDocument();
  });

  it("tints worse-side chips with sodium", () => {
    const { container } = render(<DiffStrip diffs={diffs} />);
    const worseChips = container.querySelectorAll("[data-worse='left']");
    expect(worseChips.length).toBe(2);
    worseChips.forEach((chip) => {
      expect(chip.className).toMatch(/border-bloom|text-bloom/);
    });
  });

  it("renders neutral chips without sodium tint", () => {
    const { container } = render(<DiffStrip diffs={diffs} />);
    const neutralChip = container.querySelector("[data-worse='none']");
    expect(neutralChip).toBeTruthy();
    expect(neutralChip?.className).not.toMatch(/border-bloom/);
  });
});
