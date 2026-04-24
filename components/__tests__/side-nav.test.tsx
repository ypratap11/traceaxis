import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SideNav } from "@/components/primitives/side-nav";

const items = [
  { href: "/app/incidents", label: "Incidents", icon: "incidents" as const },
  { href: "/app/uploads", label: "Uploads", icon: "uploads" as const },
  { href: "/app/settings", label: "Settings", icon: "settings" as const }
];

describe("SideNav", () => {
  it("renders the brand mark", () => {
    render(<SideNav items={items} activeHref="/app/incidents" />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("renders one link per item with an aria-label matching the item label", () => {
    render(<SideNav items={items} activeHref="/app/incidents" />);
    expect(screen.getByRole("link", { name: "Incidents" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Uploads" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Settings" })).toBeInTheDocument();
  });

  it("marks the active item via aria-current", () => {
    render(<SideNav items={items} activeHref="/app/uploads" />);
    expect(screen.getByRole("link", { name: "Uploads" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: "Incidents" })).not.toHaveAttribute(
      "aria-current"
    );
  });
});
