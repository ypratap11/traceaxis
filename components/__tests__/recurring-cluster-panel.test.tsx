import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecurringClusterPanel } from "@/components/inbox/recurring-cluster-panel";

describe("RecurringClusterPanel", () => {
  it("renders the title, description, and tags", () => {
    render(
      <RecurringClusterPanel
        title="Recurring failure cluster"
        description="Phoenix DC has shown three localization-related incidents after the latest map refresh."
        tags={[
          { k: "site", v: "Phoenix DC" },
          { k: "pattern", v: "localization drift" }
        ]}
      />
    );
    expect(screen.getByText("Recurring failure cluster")).toBeInTheDocument();
    expect(
      screen.getByText(/Phoenix DC has shown three/)
    ).toBeInTheDocument();
    expect(screen.getByText("Phoenix DC")).toBeInTheDocument();
    expect(screen.getByText("localization drift")).toBeInTheDocument();
  });
});
