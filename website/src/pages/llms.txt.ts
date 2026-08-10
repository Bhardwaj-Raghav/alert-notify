import { buildLlmsTxt } from "../data/nav";
import { frameworkGzipList, size } from "../data/size";

export const prerender = true;

export function GET() {
  const body = buildLlmsTxt(frameworkGzipList(), size.cssGzipKb);
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
