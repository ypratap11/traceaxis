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

  it("omits the animation when active=false", () => {
    render(<Pulse active={false} />);
    const el = screen.getByTestId("pulse");
    expect(el).not.toHaveClass("animate-breath");
  });

  it("respects the lg size", () => {
    render(<Pulse size="lg" />);
    const el = screen.getByTestId("pulse");
    expect(el).toHaveClass("h-3.5");
    expect(el).toHaveClass("w-3.5");
  });
});
