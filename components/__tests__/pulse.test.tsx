import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Pulse } from "@/components/primitives/pulse";

describe("Pulse", () => {
  it("renders a sodium dot with the breath animation by default", () => {
    render(<Pulse />);
    const el = screen.getByTestId("pulse");
    expect(el).toHaveClass("animate-breath");
    expect(el).toHaveClass("bg-bloom");
  });

  it("respects prefers-reduced-motion when breathing", () => {
    render(<Pulse />);
    const el = screen.getByTestId("pulse");
    expect(el.className).toMatch(/motion-reduce:animate-none/);
  });

  it("renders the dot but no animation when breathing=false", () => {
    render(<Pulse breathing={false} />);
    const el = screen.getByTestId("pulse");
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass("bg-bloom");
    expect(el).not.toHaveClass("animate-breath");
  });

  it("respects the lg size", () => {
    render(<Pulse size="lg" />);
    const el = screen.getByTestId("pulse");
    expect(el).toHaveClass("h-3.5");
    expect(el).toHaveClass("w-3.5");
  });
});
