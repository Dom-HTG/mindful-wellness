import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReadinessQuiz } from "../ReadinessQuiz";
import { AppProvider } from "../../context/AppProvider";

describe("ReadinessQuiz", () => {
  it("walks through all three questions and shows a result", async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <ReadinessQuiz />
      </AppProvider>,
    );

    await user.click(
      screen.getByRole("button", { name: /Start the 1-Minute Quiz/i }),
    );

    await user.click(
      screen.getByRole("button", {
        name: /Stress, anxiety, or late-night emotional eating/i,
      }),
    );
    await user.click(
      screen.getByRole("button", {
        name: /Behavioral therapy & cognitive habit rewiring/i,
      }),
    );
    await user.click(
      screen.getByRole("button", {
        name: /Losing weight sustainably without anxiety/i,
      }),
    );

    expect(
      screen.getByText(/Recommended Blueprint: Psychological/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Recommended Initial Action Plan/i),
    ).toBeInTheDocument();
  });

  it("shows the intro view before starting", () => {
    render(
      <AppProvider>
        <ReadinessQuiz />
      </AppProvider>,
    );
    expect(
      screen.getByText(/Is holistic weight management right for you/i),
    ).toBeInTheDocument();
  });
});
