import size from "../data/size.json";
import { buildLlmsTxt } from "../data/nav";

export const prerender = true;

export function GET() {
  const body = buildLlmsTxt(size.jsGzipKb, size.cssGzipKb);
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
