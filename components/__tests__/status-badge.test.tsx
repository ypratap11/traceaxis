import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SeverityBadge, StatusBadge } from "@/components/status-badge";

describe("SeverityBadge", () => {
  it("renders the severity label", () => {
    render(<SeverityBadge severity="critical" />);
    expect(screen.getByText("critical")).toBeInTheDocument();
  });
});

describe("StatusBadge", () => {
  it("renders the status label", () => {
    render(<StatusBadge status="investigating" />);
    expect(screen.getByText("investigating")).toBeInTheDocument();
  });
});
