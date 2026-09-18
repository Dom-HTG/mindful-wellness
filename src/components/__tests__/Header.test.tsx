import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/utils";
import { Header } from "../Header";

describe("Header", () => {
  it("shows the renamed brand", () => {
    renderWithProviders(<Header />);
    expect(screen.getByText("Mindful Wellness")).toBeInTheDocument();
  });

  it("routes About and Services to dedicated pages", () => {
    renderWithProviders(<Header />);
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "/about",
    );
    expect(screen.getByRole("link", { name: "Services" })).toHaveAttribute(
      "href",
      "/services",
    );
  });

  it("opens the mobile menu", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />);
    await user.click(
      screen.getByRole("button", { name: /toggle navigation menu/i }),
    );
    expect(screen.getByText(/toggle theme/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /qr intake/i })).toBeInTheDocument();
  });
});
