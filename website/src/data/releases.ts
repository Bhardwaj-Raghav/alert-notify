export type Release = {
  version: string;
  date?: string;
  status?: "unreleased" | "latest" | "previous";
  summary: string;
  notes: string[];
};

/** Site changelog summary. Keep in sync with root CHANGELOG.md. */
export const releases: Release[] = [
  {
    version: "3.0.0",
    date: "2026-08-09",
    status: "latest",
    summary: "Message-first API, onClose reason, auto CSS from package entry, default theme light.",
    notes: [
      "First argument is message. Optional title is the heading.",
      "onDismiss / onAutoClose become onClose(toast, reason) with Manual or Auto.",
      "HTML on standard toasts is removed. Use toast.custom() for markup.",
      "Prefer autoClose: false for sticky toasts instead of duration: Infinity.",
      "Default theme is light (was system).",
      "CSS loads with the package entry. Explicit style.css import still works.",
    ],
  },
  {
    version: "2.0.1",
    date: "2026-07-25",
    status: "previous",
    summary: "Patch release on the 2.x line.",
    notes: ["Bug fixes and packaging polish on the 2.x API."],
  },
  {
    version: "2.0.0",
    date: "2026-07-20",
    status: "previous",
    summary: "Modern toaster rewrite with stacking, themes, and framework helpers.",
    notes: [
      "Imperative toast API with success, error, warning, info, loading, message.",
      "Optional React, Vue, and Svelte Toaster wrappers.",
      "Dark / system theme and richColors.",
    ],
  },
  {
    version: "1.0.3",
    date: "2024-04-09",
    status: "previous",
    summary: "Last polish on the 1.x showAlert API.",
    notes: ["Stabilized the classic AlertNotifyContainer flow."],
  },
  {
    version: "1.0.0",
    date: "2024-04-08",
    status: "previous",
    summary: "First 1.x stable with showAlert helpers.",
    notes: ["SUCCESS / ERROR style alerts and container mounting."],
  },
  {
    version: "0.1.0",
    date: "2022-07-06",
    status: "previous",
    summary: "Initial public release.",
    notes: ["First npm publish of alert-notify."],
  },
];
