import sizeJson from "./size.json";

export type EntrySize = {
  raw: number;
  gzip: number;
  gzipKb: number;
};

export type SizeData = {
  measuredEntry: string;
  minEntry: string;
  maxEntry: string;
  entries: Record<string, EntrySize>;
  jsRaw: number;
  jsGzip: number;
  cssRaw: number;
  cssGzip: number;
  jsGzipKb: number;
  jsGzipKbMin: number;
  jsGzipKbMax: number;
  cssGzipKb: number;
  totalGzip: number;
  totalGzipKb: number;
};

export const size: SizeData = sizeJson;

/** Public size rows. Angular is a recipe on the vanilla core (same JS size). */
export const frameworkSizeRows = [
  {
    id: "vanilla",
    label: "Vanilla",
    entryKey: "vanilla",
    importHint: "Core only (alert-notify)",
  },
  {
    id: "react",
    label: "React",
    entryKey: "react",
    importHint: "Core + alert-notify/react",
  },
  {
    id: "angular",
    label: "Angular",
    entryKey: "vanilla",
    importHint: "Core only (recipe, same as vanilla)",
  },
  {
    id: "vue",
    label: "Vue",
    entryKey: "vue",
    importHint: "Core + alert-notify/vue",
  },
  {
    id: "svelte",
    label: "Svelte",
    entryKey: "svelte",
    importHint: "Core + alert-notify/svelte",
  },
] as const;

export type FrameworkSizeRow = (typeof frameworkSizeRows)[number];

export function frameworkGzipKb(row: FrameworkSizeRow, s: SizeData = size): number {
  return s.entries[row.entryKey].gzipKb;
}

/** "Vanilla ~5.3KB · React ~5.6KB · Angular ~5.3KB · Vue ~5.7KB · Svelte ~5.9KB" */
export function frameworkGzipList(s: SizeData = size): string {
  return frameworkSizeRows
    .map((row) => `${row.label} ~${frameworkGzipKb(row, s)}KB`)
    .join(" · ");
}

/** Full list + shared CSS. */
export function frameworkGzipWithCss(s: SizeData = size): string {
  return `${frameworkGzipList(s)} + ~${s.cssGzipKb}KB CSS`;
}
