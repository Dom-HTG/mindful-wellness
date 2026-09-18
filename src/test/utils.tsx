import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";
import { AppProvider } from "../context/AppProvider";

export function renderWithProviders(ui: ReactElement, route = "/") {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </AppProvider>,
  );
}
