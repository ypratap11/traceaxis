import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterGroup } from "@/components/primitives/filter-group";

const options = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" }
];

describe("FilterGroup", () => {
  it("renders the label and one pill per option", () => {
    render(
      <FilterGroup
        label="Severity"
        options={options}
        selected={[]}
        onChange={() => {}}
      />
    );
    expect(screen.getByText("Severity")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Critical" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "High" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Medium" })).toBeInTheDocument();
  });

  it("marks selected pills with aria-pressed=true", () => {
    render(
      <FilterGroup
        label="Severity"
        options={options}
        selected={["high"]}
        onChange={() => {}}
      />
    );
    expect(screen.getByRole("button", { name: "High" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Critical" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("calls onChange with the toggled set when a pill is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FilterGroup
        label="Severity"
        options={options}
        selected={["high"]}
        onChange={onChange}
      />
    );
    await user.click(screen.getByRole("button", { name: "Critical" }));
    expect(onChange).toHaveBeenCalledWith(["high", "critical"]);
    await user.click(screen.getByRole("button", { name: "High" }));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
