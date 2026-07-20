import type { APIRoute } from "astro";

function withTrailingSlash(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}

function robotsTxt(sitemapURL: URL): string {
  return `User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}
`;
}

export const GET: APIRoute = ({ site }) => {
  if (!site) {
    return new Response("User-agent: *\nAllow: /\n", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const sitemapURL = new URL(
    `${withTrailingSlash(import.meta.env.BASE_URL)}sitemap-index.xml`,
    site,
  );

  return new Response(robotsTxt(sitemapURL), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
