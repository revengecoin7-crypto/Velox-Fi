import { useEffect } from "react";

interface PageMeta {
  title: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
}

function setMeta(name: string, content: string, prop = false) {
  const attr = prop ? "property" : "name";
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function usePageMeta({ title, description, canonical, ogImage }: PageMeta) {
  useEffect(() => {
    const defaultTitle = "VeloxFi — Play Games, Earn WOLF, Win $BATTLE on Solana";
    const defaultDesc  = "Free play-to-earn game arena on Solana. Play 4 arcade games, mine WOLF tokens every 8 hours, and convert 5000 WOLF to $BATTLE.";
    const defaultImage = "https://veloxfi.io/opengraph.jpg";

    document.title = title;

    if (description) {
      setMeta("description", description);
      setMeta("og:description", description, true);
      setMeta("twitter:description", description);
    }

    setMeta("og:title", title, true);
    setMeta("twitter:title", title);
    setMeta("og:type", "website", true);
    setMeta("og:site_name", "VeloxFi", true);
    setMeta("og:image", ogImage ?? defaultImage, true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:image", ogImage ?? defaultImage);

    let canonEl = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonEl) {
      canonEl = document.createElement("link");
      canonEl.setAttribute("rel", "canonical");
      document.head.appendChild(canonEl);
    }
    canonEl.setAttribute("href", canonical ?? "https://veloxfi.io");

    return () => {
      document.title = defaultTitle;
      setMeta("description", defaultDesc);
      setMeta("og:title", defaultTitle, true);
      setMeta("og:description", defaultDesc, true);
      setMeta("twitter:title", defaultTitle);
      setMeta("twitter:description", defaultDesc);
      if (canonEl) canonEl.setAttribute("href", "https://veloxfi.io");
    };
  }, [title, description, canonical, ogImage]);
}
