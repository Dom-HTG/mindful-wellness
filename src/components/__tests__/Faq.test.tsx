import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Faq } from "../Faq";

describe("Faq", () => {
  it("opens the first question by default", () => {
    render(<Faq />);
    const first = screen.getByRole("button", {
      name: /behavioral weight management approach/i,
    });
    expect(first).toHaveAttribute("aria-expanded", "true");
  });

  it("toggles open state between questions", async () => {
    const user = userEvent.setup();
    render(<Faq />);

    const first = screen.getByRole("button", {
      name: /behavioral weight management approach/i,
    });
    const second = screen.getByRole("button", {
      name: /accept commercial medical insurance/i,
    });

    await user.click(second);
    expect(second).toHaveAttribute("aria-expanded", "true");
    expect(first).toHaveAttribute("aria-expanded", "false");
  });

  it("renders all four questions", () => {
    render(<Faq />);
    expect(
      screen.getByText(/prescribe clinical weight loss medications/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/virtually, in-person, or hybrid/i),
    ).toBeInTheDocument();
  });
});
