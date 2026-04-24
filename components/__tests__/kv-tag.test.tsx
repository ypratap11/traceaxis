import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KvTag } from "@/components/primitives/kv-tag";

describe("KvTag", () => {
  it("renders the key and value", () => {
    render(<KvTag k="cause" v="planner timeout" />);
    expect(screen.getByText("cause")).toBeInTheDocument();
    expect(screen.getByText("planner timeout")).toBeInTheDocument();
  });

  it("renders a ReactNode value", () => {
    render(
      <KvTag
        k="status"
        v={<span data-testid="custom">investigating</span>}
      />
    );
    expect(screen.getByTestId("custom")).toBeInTheDocument();
  });

  it("renders the solid time-pill variant in mono", () => {
    render(<KvTag variant="solid" v="T+04:12.380" />);
    const el = screen.getByText("T+04:12.380");
    expect(el.parentElement).toHaveClass("font-mono");
    expect(el.parentElement).toHaveClass("bg-ink-0");
  });
});
