import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Calculator } from "../Calculator";

describe("Calculator", () => {
  it("shows the default water baseline", () => {
    render(<Calculator />);
    expect(screen.getByText("92")).toBeInTheDocument();
  });

  it("updates water output when weight changes", () => {
    render(<Calculator />);
    const weight = screen.getByRole("slider", { name: "Body Weight" });
    fireEvent.change(weight, { target: { value: "200" } });
    expect(screen.getByText("112")).toBeInTheDocument();
  });
});
