import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/utils";
import { ChatWidget } from "../chatbot/ChatWidget";

describe("ChatWidget", () => {
  it("opens and shows the assistant panel", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChatWidget />);

    await user.click(screen.getByRole("button", { name: /open chat/i }));
    expect(screen.getByText("Wellness Assistant")).toBeInTheDocument();
    expect(screen.getByText(/preview — coming soon/i)).toBeInTheDocument();
  });

  it("echoes a message and returns a placeholder reply", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChatWidget />);

    await user.click(screen.getByRole("button", { name: /open chat/i }));
    await user.type(screen.getByLabelText("Chat message"), "Hello there");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(screen.getByText("Hello there")).toBeInTheDocument();
    expect(
      await screen.findByText(/our clinical team will answer/i, undefined, {
        timeout: 2000,
      }),
    ).toBeInTheDocument();
  });
});
