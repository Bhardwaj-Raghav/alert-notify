export type SupportTier = "native" | "helper" | "recipe";

export type NavLink = {
  href: string;
  label: string;
};

export type DocsNavItem = NavLink & {
  description?: string;
};

export type DocsNavGroup = {
  title: string;
  items: DocsNavItem[];
};

export type FrameworkEntry = {
  id: string;
  label: string;
  href: string;
  docsHref: string;
  tier: SupportTier;
  tierLabel: string;
  blurb: string;
};

export const siteOrigin = "https://alert-notify.vercel.app";

export const githubUrl = "https://github.com/Bhardwaj-Raghav/alert-notify";
export const npmUrl = "https://www.npmjs.com/package/alert-notify";

export const topNav: NavLink[] = [
  { href: "/docs", label: "Docs" },
  { href: "/examples", label: "Examples" },
  { href: "/changelog", label: "Changelog" },
];

export const frameworks: FrameworkEntry[] = [
  {
    id: "react",
    label: "React",
    href: "/react",
    docsHref: "/docs/react",
    tier: "helper",
    tierLabel: "Helper",
    blurb: "Optional Toaster plus custom() for React nodes.",
  },
  {
    id: "vue",
    label: "Vue",
    href: "/vue",
    docsHref: "/docs/vue",
    tier: "helper",
    tierLabel: "Helper",
    blurb: "Optional Toaster plus custom() for Vue VNodes.",
  },
  {
    id: "svelte",
    label: "Svelte",
    href: "/svelte",
    docsHref: "/docs/svelte",
    tier: "helper",
    tierLabel: "Helper",
    blurb: "Optional Toaster. Custom DOM via core toast.custom().",
  },
  {
    id: "angular",
    label: "Angular",
    href: "/angular",
    docsHref: "/docs/angular",
    tier: "recipe",
    tierLabel: "Recipe",
    blurb: "Use the core API. No Angular module ships.",
  },
  {
    id: "cdn",
    label: "CDN",
    href: "/cdn",
    docsHref: "/docs/cdn",
    tier: "native",
    tierLabel: "Native",
    blurb: "IIFE build with AlertNotify.toast and injected CSS.",
  },
];

export const docsNav: DocsNavGroup[] = [
  {
    title: "Discover",
    items: [
      { href: "/docs", label: "Overview", description: "What alert-notify is and how support tiers work" },
    ],
  },
  {
    title: "Install",
    items: [
      { href: "/docs/install", label: "Install", description: "npm and CDN install paths" },
      { href: "/docs/quick-start", label: "Quick start", description: "A working example in minutes" },
    ],
  },
  {
    title: "Choose integration",
    items: [
      { href: "/docs/react", label: "React", description: "Helper export" },
      { href: "/docs/vue", label: "Vue", description: "Helper export" },
      { href: "/docs/svelte", label: "Svelte", description: "Helper export" },
      { href: "/docs/angular", label: "Angular", description: "Recipe using core" },
      { href: "/docs/astro", label: "Astro", description: "Recipe using core" },
      { href: "/docs/cdn", label: "CDN", description: "Native IIFE" },
    ],
  },
  {
    title: "Implement",
    items: [
      { href: "/docs/api", label: "API", description: "Methods and per-toast options" },
      { href: "/docs/config", label: "Config", description: "Global toaster defaults" },
    ],
  },
  {
    title: "Customize",
    items: [
      { href: "/docs/theming", label: "Theming", description: "Theme mode and CSS variables" },
    ],
  },
  {
    title: "Examples",
    items: [
      { href: "/examples", label: "Playground", description: "Live controls and code snippets" },
    ],
  },
  {
    title: "Troubleshoot",
    items: [
      { href: "/docs/faq", label: "FAQ" },
      { href: "/docs/troubleshooting", label: "Troubleshooting" },
      { href: "/docs/migration", label: "Migration" },
    ],
  },
];

export function flattenDocsNav(): DocsNavItem[] {
  return docsNav.flatMap((group) => group.items);
}

export function buildLlmsTxt(sizeKb: number, cssKb: number): string {
  const docsLines = flattenDocsNav()
    .map((item) => `- ${item.label}: ${siteOrigin}${item.href}`)
    .join("\n");
  const frameworkLines = frameworks
    .map((fw) => `- ${fw.label} (${fw.tierLabel}): ${siteOrigin}${fw.href} · docs ${siteOrigin}${fw.docsHref}`)
    .join("\n");

  return `# alert-notify

> Tiny multi-framework toast library (~${sizeKb}KB gzip JS + ~${cssKb}KB CSS per path). Native core for any JS. Helper exports for React, Vue, and Svelte. Angular and Astro use the same core as recipes. Zero runtime dependencies. No root provider required.

## Install

\`\`\`bash
npm install alert-notify
\`\`\`

\`\`\`ts
import { toast } from "alert-notify";

toast.success("Saved");
\`\`\`

## Site map

- Home: ${siteOrigin}/
- Examples: ${siteOrigin}/examples
- Changelog: ${siteOrigin}/changelog
- Docs overview: ${siteOrigin}/docs

### Docs

${docsLines}

### Frameworks

${frameworkLines}

## Package links

- npm: ${npmUrl}
- GitHub: ${githubUrl}

## Support tiers

- Native: core \`toast\` / \`createToaster\`, CDN IIFE
- Helper: \`alert-notify/react\`, \`alert-notify/vue\`, \`alert-notify/svelte\`
- Recipe: Angular, Astro (import core, no dedicated adapter)
`;
}
