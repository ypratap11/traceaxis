import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReplayShell } from "@/components/replay/replay-shell";

describe("ReplayShell", () => {
  it("renders side nav, breadcrumb, body and footer", () => {
    render(
      <ReplayShell
        crumbs={["Incidents", "INC-2384"]}
        actions={<button>Share</button>}
        footer={<div data-testid="footer">scrubber</div>}
      >
        <p data-testid="body">incident body</p>
      </ReplayShell>
    );
    expect(screen.getByRole("link", { name: "Incidents" })).toBeInTheDocument();
    expect(screen.getByText("INC-2384")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Share" })).toBeInTheDocument();
    expect(screen.getByTestId("body")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("does not render the AppShell-style title header", () => {
    render(
      <ReplayShell crumbs={["x"]}>
        <p>body</p>
      </ReplayShell>
    );
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
  });

  it("activates the incidents tab by default", () => {
    render(
      <ReplayShell crumbs={["x"]}>
        <p>body</p>
      </ReplayShell>
    );
    expect(screen.getByRole("link", { name: "Incidents" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });
});
