import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppProvider } from "./context/AppProvider";
import { Layout } from "./components/layout/Layout";
import { DirectLinkHandler } from "./components/DirectLinkHandler";
import { Grain } from "./components/ui/Grain";
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { ServicesPage } from "./pages/ServicesPage";
import { AdminPage } from "./pages/AdminPage";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <DirectLinkHandler />
        <Grain />
        <Routes>
          <Route path="/admin/*" element={<AdminPage />} />
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="*" element={<HomePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
