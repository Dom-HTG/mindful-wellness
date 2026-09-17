import { useEffect } from "react";
import { AppProvider, useApp } from "./context/AppProvider";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Credentials } from "./components/Credentials";
import { Services } from "./components/Services";
import { ReadinessQuiz } from "./components/ReadinessQuiz";
import { Calculator } from "./components/Calculator";
import { Testimonials } from "./components/Testimonials";
import { Faq } from "./components/Faq";
import { CtaBanner } from "./components/CtaBanner";
import { Footer } from "./components/Footer";
import { BookingModal } from "./components/BookingModal";
import { QrModal } from "./components/QrModal";
import { FloatingControls } from "./components/FloatingControls";
import { ToastViewport } from "./components/Toast";

const BOOKING_HASHES = ["#book", "#booking", "#screening", "#intake"];

function DirectLinkHandler() {
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

function Page() {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <Header />
      <main className="flex-1">
        <Hero />
        <Credentials />
        <Services />
        <ReadinessQuiz />
        <Calculator />
        <Testimonials />
        <Faq />
        <CtaBanner />
      </main>
      <Footer />
      <BookingModal />
      <QrModal />
      <FloatingControls />
      <ToastViewport />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <DirectLinkHandler />
      <Page />
    </AppProvider>
  );
}
