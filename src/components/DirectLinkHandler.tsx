import { useEffect } from "react";
import { useApp } from "../context/AppProvider";

const BOOKING_HASHES = ["#book", "#booking", "#screening", "#intake"];

export function DirectLinkHandler() {
  const { openBooking } = useApp();

  useEffect(() => {
    const check = () => {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const isBookingParam =
        params.get("booking") === "true" || params.get("intake") === "true";
      if (BOOKING_HASHES.includes(hash) || isBookingParam) {
        openBooking(params.get("service") ?? "");
      }
    };
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, [openBooking]);

  return null;
}
