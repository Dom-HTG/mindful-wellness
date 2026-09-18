import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/utils";
import { HomePage } from "../HomePage";
import { AboutPage } from "../AboutPage";
import { ServicesPage } from "../ServicesPage";

describe("HomePage", () => {
  it("renders the hero and key sections", () => {
    renderWithProviders(<HomePage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /calmer path/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/personalized, science-backed offerings/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/meet your wellness assistant/i),
    ).toBeInTheDocument();
  });
});

describe("AboutPage", () => {
  it("renders the story and the clinician photo", () => {
    renderWithProviders(<AboutPage />, "/about");
    expect(
      screen.getByRole("heading", { level: 1, name: /calm hands/i }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByAltText(/lead psychiatric nurse practitioner/i).length,
    ).toBeGreaterThan(0);
  });
});

describe("ServicesPage", () => {
  it("renders all three services in detail", () => {
    renderWithProviders(<ServicesPage />, "/services");
    expect(
      screen.getByRole("heading", { level: 1, name: /personalized, science-backed care/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /psychological counseling/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /medical management/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /nutritional counseling/i }),
    ).toBeInTheDocument();
  });
});
