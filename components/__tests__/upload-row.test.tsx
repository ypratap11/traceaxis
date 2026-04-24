import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UploadRow } from "@/components/uploads/upload-row";
import type { UploadJob } from "@/lib/types";

const processing: UploadJob = {
  id: "u1",
  sourceName: "ax14-phoenix.bag",
  robot: "AX-14",
  site: "Phoenix DC",
  failureType: "Planner Timeout",
  status: "processing",
  createdAt: "2026-04-22 19:40"
};

const ready: UploadJob = {
  ...processing,
  id: "u2",
  status: "ready",
  incidentId: "inc_demo"
};

describe("UploadRow", () => {
  it("renders the filename and robot/site/failureType line", () => {
    render(<UploadRow upload={processing} />);
    expect(screen.getByText("ax14-phoenix.bag")).toBeInTheDocument();
    expect(screen.getByText(/AX-14/)).toBeInTheDocument();
    expect(screen.getByText(/Phoenix DC/)).toBeInTheDocument();
    expect(screen.getByText(/Planner Timeout/)).toBeInTheDocument();
  });

  it("shows a progress bar while processing", () => {
    const { container } = render(<UploadRow upload={processing} />);
    expect(container.querySelector("[data-progress]")).toBeTruthy();
  });

  it("shows an Open as incident link when status is ready and an incidentId exists", () => {
    render(<UploadRow upload={ready} />);
    const link = screen.getByRole("link", { name: /open as incident/i });
    expect(link).toHaveAttribute("href", "/app/incidents/inc_demo");
  });

  it("shows the status label", () => {
    render(<UploadRow upload={processing} />);
    expect(screen.getByText("processing")).toBeInTheDocument();
  });
});
