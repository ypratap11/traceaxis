import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventRow } from "@/components/primitives/event-row";

describe("EventRow", () => {
  it("renders label and timestamp", () => {
    render(
      <EventRow label="Planner timeout" timestamp="04:12.380" severity="warn" />
    );
    expect(screen.getByText("Planner timeout")).toBeInTheDocument();
    expect(screen.getByText("04:12.380")).toBeInTheDocument();
  });

  it("renders severity dot color matching the severity prop", () => {
    const { container } = render(
      <EventRow label="x" timestamp="00:00" severity="err" />
    );
    expect(container.querySelector(".bg-err")).toBeTruthy();
  });

  it("applies the active sodium styling when active=true", () => {
    const { container } = render(
      <EventRow label="x" timestamp="00:00" severity="warn" active />
    );
    expect(container.querySelector(".border-l-bloom")).toBeTruthy();
  });

  it("renders the breathing pulse dot when active", () => {
    render(<EventRow label="x" timestamp="00:00" severity="warn" active />);
    expect(screen.getByTestId("pulse")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <EventRow
        label="Planner timeout"
        timestamp="04:12.380"
        severity="warn"
        onClick={handleClick}
      />
    );
    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
