import type { Meta, StoryObj } from "@storybook/html-vite";
import { toast } from "../src/toast";
import type { ToastPosition, ToastTheme } from "../src/types";

type Args = {
  title: string;
  description: string;
  type: "success" | "error" | "warning" | "info" | "message" | "loading";
  position: ToastPosition;
  theme: ToastTheme;
  richColors: boolean;
  duration: number;
  closeButton: boolean;
  progressBar: boolean;
};

const meta: Meta<Args> = {
  title: "Toast/Playground",
  argTypes: {
    type: {
      control: "select",
      options: ["success", "error", "warning", "info", "message", "loading"],
    },
    position: {
      control: "select",
      options: [
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ],
    },
    theme: {
      control: "select",
      options: ["system", "light", "dark"],
    },
    duration: { control: { type: "number", min: 1000, max: 10000, step: 500 } },
  },
  args: {
    title: "Saved successfully",
    description: "Your changes are live.",
    type: "success",
    position: "top-right",
    theme: "system",
    richColors: true,
    duration: 4000,
    closeButton: true,
    progressBar: true,
  },
};

export default meta;
type Story = StoryObj<Args>;

function mount(args: Args): HTMLElement {
  toast.config({
    position: args.position,
    theme: args.theme,
    richColors: args.richColors,
    progressBar: args.progressBar,
    closeButton: args.closeButton,
    duration: args.duration,
  });

  const root = document.createElement("div");
  root.style.cssText =
    "display:flex;flex-direction:column;gap:12px;align-items:center;min-width:280px;font-family:system-ui,sans-serif";

  const button = document.createElement("button");
  button.textContent = "Show toast";
  button.style.cssText =
    "padding:12px 16px;border-radius:12px;border:1px solid #ccc;background:#0f766e;color:#fff;font-weight:700;cursor:pointer";
  button.addEventListener("click", () => {
    toast[args.type](args.title, {
      description: args.description,
      duration: args.duration,
      closeButton: args.closeButton,
    });
  });

  const promiseBtn = document.createElement("button");
  promiseBtn.textContent = "Promise toast";
  promiseBtn.style.cssText =
    "padding:12px 16px;border-radius:12px;border:1px solid #ccc;background:#fff;cursor:pointer;font-weight:600";
  promiseBtn.addEventListener("click", () => {
    const work = new Promise<string>((resolve) =>
      setTimeout(() => resolve("file.png"), 1500),
    );
    toast.promise(work, {
      loading: "Uploading…",
      success: (name) => `Uploaded ${name}`,
      error: "Failed",
    });
  });

  const undoBtn = document.createElement("button");
  undoBtn.textContent = "Undo action";
  undoBtn.style.cssText =
    "padding:12px 16px;border-radius:12px;border:1px solid #ccc;background:#fff;cursor:pointer;font-weight:600";
  undoBtn.addEventListener("click", () => {
    toast.success("Deleted", {
      description: "You can restore this item.",
      action: {
        label: "Undo",
        onClick: () => toast.message("Restored"),
      },
    });
  });

  root.append(button, promiseBtn, undoBtn);
  return root;
}

export const Playground: Story = {
  render: (args) => mount(args),
};

export const AllTypes: Story = {
  render: () => {
    const root = document.createElement("div");
    root.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;max-width:420px";
    const types = ["success", "error", "warning", "info", "message", "loading"] as const;
    for (const type of types) {
      const btn = document.createElement("button");
      btn.textContent = type;
      btn.style.cssText =
        "padding:10px 12px;border-radius:10px;border:1px solid #ddd;background:#fff;cursor:pointer;text-transform:capitalize";
      btn.addEventListener("click", () => toast[type](`${type} toast`));
      root.appendChild(btn);
    }
    return root;
  },
};
