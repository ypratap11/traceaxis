import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Panel } from "@/components/primitives/panel";

describe("Panel", () => {
  it("renders children", () => {
    render(
      <Panel>
        <p>body content</p>
      </Panel>
    );
    expect(screen.getByText("body content")).toBeInTheDocument();
  });

  it("renders eyebrow and title in the header when provided", () => {
    render(
      <Panel eyebrow="Replay · Telemetry" title="cmd_vel.linear_x">
        <p>x</p>
      </Panel>
    );
    expect(screen.getByText("Replay · Telemetry")).toBeInTheDocument();
    expect(screen.getByText("cmd_vel.linear_x")).toBeInTheDocument();
  });

  it("renders actions in the header when provided", () => {
    render(
      <Panel title="x" actions={<button>action</button>}>
        <p>y</p>
      </Panel>
    );
    expect(screen.getByRole("button", { name: "action" })).toBeInTheDocument();
  });

  it("does not render the header when no eyebrow/title/actions are provided", () => {
    const { container } = render(
      <Panel>
        <p>body</p>
      </Panel>
    );
    expect(container.querySelector("header")).toBeNull();
  });
});
