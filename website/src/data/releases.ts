import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type ReleaseBlock =
  | { type: "list"; items: string[] }
  | { type: "paragraph"; text: string }
  | { type: "code"; lang?: string; code: string };

export type ReleaseSection = {
  title: string;
  blocks: ReleaseBlock[];
};

export type Release = {
  version: string;
  date?: string;
  status?: "unreleased" | "latest" | "previous";
  href?: string;
  sections: ReleaseSection[];
};

const dataDir = path.dirname(fileURLToPath(import.meta.url));

function resolveChangelogPath(): string {
  const candidates = [
    path.resolve(process.cwd(), "CHANGELOG.md"),
    path.resolve(process.cwd(), "../CHANGELOG.md"),
    path.resolve(dataDir, "../../../CHANGELOG.md"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(
    `CHANGELOG.md not found (cwd=${process.cwd()}, tried: ${candidates.join(", ")})`,
  );
}

/** Keep a Changelog link footer: `[3.0.0]: https://...` */
function parseLinkDefs(markdown: string): Map<string, string> {
  const links = new Map<string, string>();
  for (const line of markdown.split(/\r?\n/)) {
    const match = line.match(/^\[([^\]]+)\]:\s+(\S+)\s*$/);
    if (match) links.set(match[1], match[2]);
  }
  return links;
}

/** Prefer site-relative paths for our own docs links. */
export function rewriteChangelogLinks(text: string): string {
  return text.replace(
    /https:\/\/alert-notify\.vercel\.app(\/[^\s)]*)/g,
    "$1",
  );
}

function pushParagraph(blocks: ReleaseBlock[], text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;
  blocks.push({ type: "paragraph", text: rewriteChangelogLinks(trimmed) });
}

function parseSectionBody(body: string): ReleaseBlock[] {
  const blocks: ReleaseBlock[] = [];
  const lines = body.split(/\r?\n/);
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^```/.test(line)) {
      const lang = line.slice(3).trim() || undefined;
      i += 1;
      const codeLines: string[] = [];
      while (i < lines.length && !/^```/.test(lines[i])) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      blocks.push({ type: "code", lang, code: codeLines.join("\n") });
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(rewriteChangelogLinks(lines[i].replace(/^\s*[-*]\s+/, "")));
        i += 1;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    if (!line.trim()) {
      i += 1;
      continue;
    }

    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^```/.test(lines[i]) && !/^\s*[-*]\s+/.test(lines[i]) && !/^###\s+/.test(lines[i])) {
      para.push(lines[i].trim());
      i += 1;
    }
    pushParagraph(blocks, para.join(" "));
  }

  return blocks;
}

function parseReleaseBody(body: string): ReleaseSection[] {
  const sections: ReleaseSection[] = [];
  const headingRe = /^###\s+(.+)$/gm;
  const matches = [...body.matchAll(headingRe)];

  if (matches.length === 0) {
    const blocks = parseSectionBody(body);
    return blocks.length ? [{ title: "", blocks }] : [];
  }

  const firstIndex = matches[0].index ?? 0;
  if (firstIndex > 0) {
    const blocks = parseSectionBody(body.slice(0, firstIndex));
    if (blocks.length) sections.push({ title: "", blocks });
  }

  for (let i = 0; i < matches.length; i++) {
    const title = matches[i][1].trim();
    const start = (matches[i].index ?? 0) + matches[i][0].length;
    const end =
      i + 1 < matches.length ? (matches[i + 1].index ?? body.length) : body.length;
    sections.push({ title, blocks: parseSectionBody(body.slice(start, end)) });
  }

  return sections;
}

/** Parse root CHANGELOG.md into release entries for the site. */
export function parseChangelog(markdown: string): Release[] {
  const links = parseLinkDefs(markdown);
  const bodyEnd = markdown.search(/\n\[[^\]]+\]:\s+\S+\s*$/m);
  const withoutFooter = bodyEnd === -1 ? markdown : markdown.slice(0, bodyEnd);
  const chunks = withoutFooter.split(/^##\s+/m).slice(1);
  const releases: Release[] = [];

  for (const chunk of chunks) {
    const nl = chunk.indexOf("\n");
    const heading = (nl === -1 ? chunk : chunk.slice(0, nl)).trim();
    const body = nl === -1 ? "" : chunk.slice(nl + 1);
    const match = heading.match(/^\[([^\]]+)\](?:\s*-\s*(\d{4}-\d{2}-\d{2}))?/);
    if (!match) continue;

    const version = match[1];
    const date = match[2];
    releases.push({
      version,
      date,
      href: links.get(version),
      sections: parseReleaseBody(body),
    });
  }

  let sawLatest = false;
  for (const release of releases) {
    if (/^unreleased$/i.test(release.version)) {
      release.status = "unreleased";
      continue;
    }
    if (!sawLatest) {
      release.status = "latest";
      sawLatest = true;
    } else {
      release.status = "previous";
    }
  }

  return releases;
}

/** Site changelog — sourced from the package root CHANGELOG.md. */
export const releases: Release[] = parseChangelog(
  fs.readFileSync(resolveChangelogPath(), "utf8"),
);
