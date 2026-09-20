import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const NON_SECTION_HASHES = ["book", "booking", "screening", "intake"];

export function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const id = hash.replace(/^#/, "");
    if (id && !NON_SECTION_HASHES.includes(id)) {
      const timer = window.setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
      return () => window.clearTimeout(timer);
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);

  return null;
}
