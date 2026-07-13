import { useEffect } from "react";

interface SeoOptions {
  /** Full page title, e.g. "Business Banking - Corvenza Capital Finance" */
  title: string;
  /** Meta description for search engines (roughly 50-160 characters) */
  description: string;
  /** Path relative to the site root, e.g. "/business". Defaults to the current path. */
  path?: string;
}

const SITE_URL = "https://corvenzacapitalfianance.com";

function setMetaByName(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setMetaByProperty(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Sets the document title, meta description, canonical URL, and social share
 * tags for the current page. This app is a client-rendered SPA (no SSR), so
 * these updates run on mount/route change - Google's crawler executes JS and
 * will see the updated tags before indexing.
 */
export function useSeo({ title, description, path }: SeoOptions) {
  useEffect(() => {
    const url = `${SITE_URL}${path ?? window.location.pathname}`;

    document.title = title;
    setMetaByName("description", description);
    setCanonical(url);

    setMetaByProperty("og:title", title);
    setMetaByProperty("og:description", description);
    setMetaByProperty("og:url", url);

    setMetaByName("twitter:title", title);
    setMetaByName("twitter:description", description);
  }, [title, description, path]);
}
