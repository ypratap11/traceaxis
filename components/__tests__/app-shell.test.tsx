import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppShell } from "@/components/app-shell";

describe("AppShell", () => {
  it("renders the title and subtitle", () => {
    render(
      <AppShell title="Incident Inbox" subtitle="Scan recent failures.">
        <p>body</p>
      </AppShell>
    );
    expect(screen.getByText("Incident Inbox")).toBeInTheDocument();
    expect(screen.getByText("Scan recent failures.")).toBeInTheDocument();
  });

  it("renders the children", () => {
    render(
      <AppShell title="x" subtitle="y">
        <p data-testid="child">body</p>
      </AppShell>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders the side nav with all three nav targets", () => {
    render(
      <AppShell title="x" subtitle="y">
        <p>body</p>
      </AppShell>
    );
    expect(screen.getByRole("link", { name: "Incidents" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Uploads" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Settings" })).toBeInTheDocument();
  });

  it("renders header actions when provided", () => {
    render(
      <AppShell
        title="x"
        subtitle="y"
        actions={<button>Upload Run</button>}
      >
        <p>body</p>
      </AppShell>
    );
    expect(
      screen.getByRole("button", { name: "Upload Run" })
    ).toBeInTheDocument();
  });
});
