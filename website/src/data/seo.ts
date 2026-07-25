import size from "./size.json";

export const siteName = "alert-notify";

export const title =
  "alert-notify — React toast, toastify alternative & toast notifications (~4.7KB)";

export const description = `Tiny toast notification library for React, Vue, Svelte, Angular, and vanilla JS. ~${size.jsGzipKb}KB gzip — a lightweight alternative to react-toastify, react-hot-toast, Sonner, and react-alert. No provider required.`;

export const ogTitle = `${siteName} — React toast & notification library (~${size.jsGzipKb}KB)`;

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
    answer: `alert-notify is a tiny (~${size.jsGzipKb}KB gzip) toast notification library for React and every other framework. Call toast.success / toast.error from anywhere — no root provider. It is a lightweight alternative to react-toastify, react-hot-toast, Sonner, react-alert, and notistack.`,
  },
  {
    question: "Is alert-notify an alternative to react-toastify or toastify?",
    answer:
      "Yes. If you searched for react-toastify, toastify, or tostify, alert-notify covers the same job — success, error, warning, info, loading, and promise toasts — in a much smaller package with zero runtime dependencies and no React lock-in.",
  },
  {
    question: "Can I use it instead of react-hot-toast or Sonner?",
    answer:
      "Yes. alert-notify is similar in spirit to react-hot-toast and Sonner (simple imperative API, stacking, rich colors) but works in React, Vue, Svelte, Angular, Astro, and plain HTML. Optional <Toaster /> wrappers exist for React, Vue, and Svelte.",
  },
  {
    question: "Does it replace react-alert or other React notification / snackbar libs?",
    answer:
      "If you need react-alert style notifications, React snackbars, or general React notification toasts, alert-notify can replace them. Same patterns: success/error messages, actions like Undo, dismiss, and position control — without a required container.",
  },
  {
    question: "Does it work without React?",
    answer:
      "Yes. The core is vanilla TypeScript. Use it from Vue, Svelte, Angular, Astro islands, or a CDN script tag. Framework packages only sync config props; the portal auto-mounts.",
  },
  {
    question: "How do I install and show a toast?",
    answer:
      'npm install alert-notify, import alert-notify/style.css, then call toast.success("Saved") or toast.error("Failed"). No provider and no root portal component are required.',
  },
] as const;

export const alternatives = [
  {
    name: "react-toastify / toastify",
    note: "Popular React toastify stack; larger bundle. alert-notify targets the same toast UX in ~4–5KB with no framework lock-in.",
  },
  {
    name: "react-hot-toast",
    note: "Minimal React toasts. alert-notify matches the imperative feel and stays usable outside React.",
  },
  {
    name: "Sonner",
    note: "Polished React toasts. alert-notify is smaller and framework-agnostic if you ship Vue, Svelte, or vanilla too.",
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
