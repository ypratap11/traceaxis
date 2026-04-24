import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TopBar } from "@/components/primitives/top-bar";

describe("TopBar", () => {
  it("renders breadcrumb segments separated by '/'", () => {
    render(<TopBar crumbs={["Incidents", "Phoenix DC", "INC-2384"]} />);
    expect(screen.getByText("Incidents")).toBeInTheDocument();
    expect(screen.getByText("Phoenix DC")).toBeInTheDocument();
    expect(screen.getByText("INC-2384")).toBeInTheDocument();
    expect(screen.getAllByText("/").length).toBe(2);
  });

  it("highlights the last crumb as the current page", () => {
    render(<TopBar crumbs={["Incidents", "INC-2384"]} />);
    expect(screen.getByText("INC-2384")).toHaveClass("text-ink-0");
  });

  it("renders actions when provided", () => {
    render(
      <TopBar
        crumbs={["x"]}
        actions={<button>Share</button>}
      />
    );
    expect(screen.getByRole("button", { name: "Share" })).toBeInTheDocument();
  });
});
