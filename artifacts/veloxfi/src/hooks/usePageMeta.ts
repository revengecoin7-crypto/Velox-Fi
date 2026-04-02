import { useEffect } from "react";

interface PageMeta {
  title: string;
  description?: string;
  canonical?: string;
}

export function usePageMeta({ title, description, canonical }: PageMeta) {
  useEffect(() => {
    document.title = title;

    let descEl = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (descEl && description) {
      descEl.setAttribute("content", description);
    }

    let canonEl = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonEl) {
      canonEl = document.createElement("link");
      canonEl.setAttribute("rel", "canonical");
      document.head.appendChild(canonEl);
    }
    canonEl.setAttribute("href", canonical ?? "https://veloxfi.io");

    return () => {
      document.title = "VeloxFi — Memecoin Battle Platform on Solana";
      if (descEl) {
        descEl.setAttribute(
          "content",
          "The first memecoin battle arena on Solana. Create your coin, challenge rivals, and win. Highest % price surge wins. $BATTLE token presale coming soon."
        );
      }
      if (canonEl) {
        canonEl.setAttribute("href", "https://veloxfi.io");
      }
    };
  }, [title, description, canonical]);
}
