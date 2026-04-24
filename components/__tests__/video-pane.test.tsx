import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VideoPane } from "@/components/replay/video-pane";

describe("VideoPane", () => {
  it("renders the camera label and source path", () => {
    render(<VideoPane label="Forward camera" source="/camera/front · 30 fps" />);
    expect(screen.getByText("Forward camera")).toBeInTheDocument();
    expect(screen.getByText(/\/camera\/front/)).toBeInTheDocument();
  });

  it("renders a play affordance", () => {
    render(<VideoPane label="x" source="y" />);
    expect(screen.getByLabelText(/play preview/i)).toBeInTheDocument();
  });

  it("renders the cursor footer when provided", () => {
    render(
      <VideoPane
        label="x"
        source="y"
        frame="frame 372 / 387"
        timestamp="04:12.380"
      />
    );
    expect(screen.getByText("frame 372 / 387")).toBeInTheDocument();
    expect(screen.getByText("04:12.380")).toBeInTheDocument();
  });
});
