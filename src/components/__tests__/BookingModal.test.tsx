import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BookingModal } from "../BookingModal";
import { AppProvider, useApp } from "../../context/AppProvider";

function Harness() {
  const { openBooking } = useApp();
  return (
    <>
      <button type="button" onClick={() => openBooking("Medical Management")}>
        open
      </button>
      <BookingModal />
    </>
  );
}

describe("BookingModal", () => {
  it("submits a full intake and shows the success view", async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <Harness />
      </AppProvider>,
    );

    await user.click(screen.getByRole("button", { name: "open" }));
    expect(screen.getByText("Health Screening Survey")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /Continue to Schedule Consultation/i }),
    );
    expect(screen.getByText("Schedule & Contact Details")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("Full Name"), "Jane Doe");
    await user.type(
      screen.getByPlaceholderText("Email Address"),
      "jane@example.com",
    );
    await user.type(screen.getByPlaceholderText("Phone Number"), "555-1234");

    await user.click(screen.getByRole("checkbox"));
    await user.click(
      screen.getByRole("button", { name: /Submit & Transfer to Clinic Email/i }),
    );

    expect(screen.getByText("Intake & Consultation Received")).toBeInTheDocument();
    expect(screen.getByText(/Medical Management/i)).toBeInTheDocument();
  });

  it("starts on step one with the preselectable service", async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <Harness />
      </AppProvider>,
    );

    await user.click(screen.getByRole("button", { name: "open" }));
    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
  });
});
