import {
  Plant,
  InstagramLogo,
  LinkedinLogo,
  MapPin,
  Phone,
  Envelope,
  QrCode,
  WarningOctagon,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { CLINIC_CONFIG } from "../lib/config";
import { useApp } from "../context/AppProvider";
import { copyText } from "../lib/clipboard";
import { Container } from "./ui/Container";

export function Footer() {
  const { openBooking, openQr, toast } = useApp();

  const copy = async (text: string, label: string) => {
    const ok = await copyText(text);
    toast(ok ? `${label} copied to clipboard` : text);
  };

  const links = [
    { label: "Our Pillars & Offerings", to: "/services" },
    { label: "Practitioner Credentials", to: "/about" },
    { label: "Client Testimonials", to: "/#testimonials" },
    { label: "Frequently Asked Questions", to: "/#faqs" },
  ];

  return (
    <footer className="border-t border-moss/10 bg-forest-deep text-bone">
      <Container className="grid grid-cols-1 gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-moss text-bone-50">
              <Plant size={22} weight="fill" />
            </span>
            <span className="font-display text-lg font-semibold">
              Mindful Wellness
            </span>
          </Link>
          <p className="text-sm leading-relaxed text-bone/70">
            A board-certified psychiatric nursing and clinical health practice
            helping clients rewrite behavioral habits and build vibrant
            metabolic wellness.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              aria-label="Instagram"
              className="text-bone/50 transition-colors hover:text-amber"
            >
              <InstagramLogo size={22} />
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              className="text-bone/50 transition-colors hover:text-amber"
            >
              <LinkedinLogo size={22} />
            </a>
            <a
              href="#"
              aria-label="Location"
              className="text-bone/50 transition-colors hover:text-amber"
            >
              <MapPin size={22} />
            </a>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-moss-light">
            Practice Links
          </h4>
          <ul className="space-y-3 text-sm text-bone/70">
            {links.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="transition-colors hover:text-amber">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => openBooking()}
                className="transition-colors hover:text-amber"
              >
                Schedule Consultation
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => openQr()}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-amber"
              >
                <QrCode size={16} className="text-moss-light" />
                Mobile QR Intake Link
              </button>
            </li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-moss-light">
            Get In Touch
          </h4>
          <ul className="space-y-4 text-sm text-bone/70">
            <li>
              <button
                type="button"
                onClick={() => copy(CLINIC_CONFIG.phone, "Phone number")}
                className="group flex items-start gap-3 text-left transition-colors hover:text-amber"
              >
                <Phone size={20} className="mt-0.5 shrink-0 text-moss-light" />
                {CLINIC_CONFIG.phone}
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => copy(CLINIC_CONFIG.email, "Email address")}
                className="group flex items-start gap-3 text-left transition-colors hover:text-amber"
              >
                <Envelope size={20} className="mt-0.5 shrink-0 text-moss-light" />
                {CLINIC_CONFIG.email}
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() =>
                  copy(
                    `${CLINIC_CONFIG.address.line1}, ${CLINIC_CONFIG.address.line2}`,
                    "Clinic address",
                  )
                }
                className="group flex items-start gap-3 text-left transition-colors hover:text-amber"
              >
                <MapPin size={20} className="mt-0.5 shrink-0 text-moss-light" />
                <span>
                  {CLINIC_CONFIG.address.line1}
                  <br />
                  {CLINIC_CONFIG.address.line2}
                </span>
              </button>
            </li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-moss-light">
            Hours &amp; Support
          </h4>
          <div className="space-y-2 text-sm text-bone/70">
            {CLINIC_CONFIG.hours.map((row) => (
              <div key={row.days} className="flex justify-between gap-4">
                <span>{row.days}</span>
                <span className={row.muted ? "font-medium text-moss-light" : ""}>
                  {row.time}
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-red-300">
              <WarningOctagon size={18} className="shrink-0" />
              {CLINIC_CONFIG.crisisLine.label}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-bone/60">
              {CLINIC_CONFIG.crisisLine.note}
            </p>
          </div>
        </div>
      </Container>

      <div className="border-t border-bone/10">
        <Container className="flex flex-col items-center justify-between gap-4 py-8 text-xs text-bone/40 md:flex-row">
          <p>
            &copy; 2026 {CLINIC_CONFIG.name}, LLC. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-amber">
              Privacy Policy
            </a>
            <a href="#" className="transition-colors hover:text-amber">
              Terms of Service
            </a>
            <a href="#" className="transition-colors hover:text-amber">
              Medical Disclaimer
            </a>
          </div>
        </Container>
      </div>
    </footer>
  );
}
