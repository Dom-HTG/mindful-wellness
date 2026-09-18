import { Outlet } from "react-router-dom";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { BookingModal } from "../BookingModal";
import { QrModal } from "../QrModal";
import { FloatingControls } from "../FloatingControls";
import { ToastViewport } from "../Toast";
import { ChatWidget } from "../chatbot/ChatWidget";
import { ScrollManager } from "./ScrollManager";

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <ScrollManager />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <BookingModal />
      <QrModal />
      <FloatingControls />
      <ChatWidget />
      <ToastViewport />
    </div>
  );
}
