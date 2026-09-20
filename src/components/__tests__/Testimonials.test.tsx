import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Testimonials } from "../Testimonials";

describe("Testimonials", () => {
  it("shows the first testimonial initially", () => {
    render(<Testimonials />);
    expect(screen.getByText("Sarah M.")).toBeInTheDocument();
  });

  it("navigates to the next testimonial", async () => {
    const user = userEvent.setup();
    render(<Testimonials />);

    await user.click(
      screen.getByRole("button", { name: "Next testimonial" }),
    );
    expect(screen.getByText("David L.")).toBeInTheDocument();
  });

  it("navigates to the previous testimonial", async () => {
    const user = userEvent.setup();
    render(<Testimonials />);

    await user.click(
      screen.getByRole("button", { name: "Previous testimonial" }),
    );
    expect(screen.getByText("Elena R.")).toBeInTheDocument();
  });
});
