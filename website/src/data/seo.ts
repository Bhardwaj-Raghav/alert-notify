import { frameworkGzipList, frameworkGzipWithCss, size } from "./size";

/** Production origin. Keep in sync with astro.config `site` default. */
export const siteOrigin = "https://alert-notify.vercel.app";

export const siteName = "alert-notify";

export const title = "alert-notify — toast notifications";

export const description = `Tiny multi-framework toast library. No provider. Dark/system theme and richColors. ${frameworkGzipWithCss()}. Alternative to toastify, hot-toast, and Sonner.`;

export const ogTitle = title;

/** Short home-only keyword list. Pass via Base props; do not dump sitewide. */
export const keywords = [
  "alert-notify",
  "toast notifications",
  "react toast",
  "vue toast",
  "svelte toast",
  "toastify alternative",
  "sonner alternative",
].join(", ");

export const faqs = [
  {
    question: "What is a good React toast notification library?",
    answer: `alert-notify is a toast library for React and every other framework (${frameworkGzipList()}, plus optional ~${size.cssGzipKb}KB CSS). Call toast.success / toast.error from anywhere with no root provider. Built as an alternative to react-hot-toast, Sonner, react-toastify, react-alert, and notistack.`,
  },
  {
    question: "Is alert-notify an alternative to react-toastify or toastify?",
    answer:
      "Yes. If you searched for react-toastify, toastify, or tostify, alert-notify covers the same job: success, error, warning, info, loading, and promise toasts, with zero runtime dependencies and no React lock-in.",
  },
  {
    question: "Can I use it instead of react-hot-toast or Sonner?",
    answer:
      "Yes. You get the familiar imperative toast API with Vue/Svelte/Angular/vanilla support, no required provider, and built-in dark/system theme plus richColors. Versus Sonner you stay smaller; versus hot-toast you gain frameworks and theme UX; versus both you avoid React lock-in. Optional <Toaster /> wrappers exist for React, Vue, and Svelte.",
  },
  {
    question: "Does it replace react-alert or other React notification / snackbar libs?",
    answer:
      "If you need react-alert style notifications, React snackbars, or general React notification toasts, alert-notify can replace them. Same patterns: success/error messages, actions like Undo, dismiss, and position control, without a required container.",
  },
  {
    question: "Does it work without React?",
    answer:
      "Yes. The core is vanilla TypeScript. Use it from Vue, Svelte, Angular, Astro islands, or a CDN script tag. Framework packages only sync config props; the portal auto-mounts.",
  },
  {
    question: "How do I install and show a toast?",
    answer:
      'npm install alert-notify, then call toast.success("Saved") or toast.error("Failed"). CSS loads with the package entry. No provider and no root portal component are required.',
  },
  {
    question: "What is supported for Angular and Astro?",
    answer:
      "Angular and Astro are recipes. Import toast from alert-notify and call the same API. There is no dedicated Angular or Astro package export.",
  },
] as const;

export const alternatives = [
  {
    name: "react-toastify / toastify",
    note: `Popular React toastify stack; much larger bundle. alert-notify covers the same flows (${frameworkGzipList()}, plus optional CSS) with no framework lock-in.`,
  },
  {
    name: "react-hot-toast",
    note: "Slightly smaller for React-only apps. Switch to alert-notify for multi-framework support, no required provider, built-in dark/system theme, richColors, progress bar, and swipe dismiss.",
  },
  {
    name: "Sonner",
    note: "Polished React toasts. alert-notify is smaller, framework-agnostic, and does not require a root toaster for the portal to work.",
  },
  {
    name: "react-alert / react notifications",
    note: "Alert and notification patterns for React. Use toast.success / toast.error / toast.info for the same messaging jobs.",
  },
  {
    name: "notistack / snackbars",
    note: "Material-style snackbars. alert-notify covers snackbar-like toasts with positions, actions, and stacking.",
  },
] as const;

export type OgType = "website" | "article";

export function pageMeta(opts: {
  title: string;
  description: string;
  ogTitle?: string;
  keywords?: string;
  ogType?: OgType;
}) {
  return {
    title: opts.title,
    description: opts.description,
    ogTitle: opts.ogTitle ?? opts.title,
    keywords: opts.keywords,
    ogType: opts.ogType ?? ("website" as OgType),
  };
}
