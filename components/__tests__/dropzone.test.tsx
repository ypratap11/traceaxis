import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dropzone } from "@/components/uploads/dropzone";

describe("Dropzone", () => {
  it("renders the headline and browse button", () => {
    render(<Dropzone onBrowse={() => {}} />);
    expect(
      screen.getByText(/drop a ROS bag or log archive/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /browse/i })).toBeInTheDocument();
  });

  it("calls onBrowse when the browse button is clicked", async () => {
    const user = userEvent.setup();
    const onBrowse = vi.fn();
    render(<Dropzone onBrowse={onBrowse} />);
    await user.click(screen.getByRole("button", { name: /browse/i }));
    expect(onBrowse).toHaveBeenCalledOnce();
  });

  it("accepts a custom headline prop", () => {
    render(<Dropzone onBrowse={() => {}} headline="Custom copy" />);
    expect(screen.getByText("Custom copy")).toBeInTheDocument();
  });
});
