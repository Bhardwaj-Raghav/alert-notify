import size from "./size.json";

export const siteName = "alert-notify";

export const title =
  "alert-notify: toast notifications for React, Vue, Svelte & vanilla";

export const description = `Tiny multi-framework toast library. Alternative to react-toastify, react-hot-toast, Sonner, and react-alert. No provider required. Built-in dark/system theme and richColors. ~${size.jsGzipKb}KB gzip JS + ~${size.cssGzipKb}KB CSS per path.`;

export const ogTitle = `${siteName}: toast notifications without the React lock-in`;

/** Target queries woven into meta + on-page copy (not keyword stuffing alone). */
export const keywords = [
  "alert-notify",
  "toast",
  "toast notification",
  "toast notifications",
  "javascript toast",
  "js toast",
  "react toast",
  "react toast notification",
  "react notification",
  "react notifications",
  "react alert",
  "react-alert",
  "react toastify",
  "react-toastify",
  "toastify",
  "tostify",
  "react-hot-toast",
  "hot toast",
  "sonner",
  "sonner alternative",
  "notistack",
  "snackbar",
  "react snackbar",
  "vue toast",
  "vue notification",
  "svelte toast",
  "angular toast",
  "astro toast",
  "toast library",
  "notification library",
  "alert library",
  "lightweight toast",
  "framework agnostic toast",
  "vanilla js toast",
  "npm toast",
  "toast message",
  "success toast",
  "error toast",
].join(", ");

export const faqs = [
  {
    question: "What is a good React toast notification library?",
    answer: `alert-notify is a toast library for React and every other framework (~${size.jsGzipKb}KB gzip JS per path, plus optional ~${size.cssGzipKb}KB CSS). Call toast.success / toast.error from anywhere with no root provider. Built as an alternative to react-hot-toast, Sonner, react-toastify, react-alert, and notistack.`,
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
    note: `Popular React toastify stack; much larger bundle. alert-notify covers the same flows in ~${size.jsGzipKb}KB JS (+ optional CSS) with no framework lock-in.`,
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

export function pageMeta(opts: {
  title: string;
  description: string;
  ogTitle?: string;
}) {
  return {
    title: opts.title,
    description: opts.description,
    ogTitle: opts.ogTitle ?? opts.title,
  };
}
