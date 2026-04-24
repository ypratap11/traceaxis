import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SeverityBadge, StatusBadge } from "@/components/status-badge";

describe("SeverityBadge", () => {
  it("renders the severity label", () => {
    render(<SeverityBadge severity="critical" />);
    expect(screen.getByText("critical")).toBeInTheDocument();
  });

  it("uses the err semantic color for critical", () => {
    render(<SeverityBadge severity="critical" />);
    expect(screen.getByText("critical")).toHaveClass("text-err");
  });

  it("uses the warn semantic color for high", () => {
    render(<SeverityBadge severity="high" />);
    expect(screen.getByText("high")).toHaveClass("text-warn");
  });

  it("uses the info semantic color for medium", () => {
    render(<SeverityBadge severity="medium" />);
    expect(screen.getByText("medium")).toHaveClass("text-info");
  });
});

describe("StatusBadge", () => {
  it("renders the status label", () => {
    render(<StatusBadge status="investigating" />);
    expect(screen.getByText("investigating")).toBeInTheDocument();
  });

  it("uses the info semantic color for investigating", () => {
    render(<StatusBadge status="investigating" />);
    expect(screen.getByText("investigating")).toHaveClass("text-info");
  });

  it("uses the ok semantic color for resolved", () => {
    render(<StatusBadge status="resolved" />);
    expect(screen.getByText("resolved")).toHaveClass("text-ok");
  });

  it("does not use the bloom (sodium) color for any status", () => {
    const { container: c1 } = render(<StatusBadge status="new" />);
    const { container: c2 } = render(<StatusBadge status="investigating" />);
    const { container: c3 } = render(<StatusBadge status="resolved" />);
    expect(c1.querySelector(".text-bloom")).toBeNull();
    expect(c2.querySelector(".text-bloom")).toBeNull();
    expect(c3.querySelector(".text-bloom")).toBeNull();
  });
});
