import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TopicInspectorPanel } from "@/components/replay/topic-inspector-panel";

const topics = [
  {
    name: "/move_base/cmd_vel",
    type: "geometry_msgs",
    samples: 1248,
    pinned: true
  },
  {
    name: "/amcl_pose",
    type: "geometry_msgs",
    samples: 312,
    pinned: true
  },
  { name: "/scan", type: "sensor_msgs", samples: 1289, pinned: false }
];

describe("TopicInspectorPanel", () => {
  it("renders all topics by default", () => {
    render(<TopicInspectorPanel topics={topics} />);
    expect(screen.getByText("/move_base/cmd_vel")).toBeInTheDocument();
    expect(screen.getByText("/amcl_pose")).toBeInTheDocument();
    expect(screen.getByText("/scan")).toBeInTheDocument();
  });

  it("filters topics when the user types in the search field", async () => {
    const user = userEvent.setup();
    render(<TopicInspectorPanel topics={topics} />);
    await user.type(screen.getByPlaceholderText(/search topics/i), "amcl");
    expect(screen.queryByText("/move_base/cmd_vel")).toBeNull();
    expect(screen.getByText("/amcl_pose")).toBeInTheDocument();
  });

  it("marks pinned topics with a sodium dot indicator", () => {
    const { container } = render(<TopicInspectorPanel topics={topics} />);
    expect(container.querySelectorAll("[data-pinned-dot]").length).toBe(2);
  });
});
