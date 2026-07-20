import type { Meta, StoryObj } from "@storybook/html-vite";
import { toast } from "../src/toast";

const meta: Meta = {
  title: "Toast/Sizes",
};

export default meta;
type Story = StoryObj;

export const StackAndExpand: Story = {
  render: () => {
    toast.config({ visibleToasts: 3, expand: false, richColors: true });
    const root = document.createElement("div");
    const btn = document.createElement("button");
    btn.textContent = "Fire 5 stacked toasts";
    btn.style.cssText =
      "padding:12px 16px;border-radius:12px;border:0;background:#115e59;color:#fff;font-weight:700;cursor:pointer";
    btn.addEventListener("click", () => {
      for (let i = 1; i <= 5; i += 1) {
        toast.message(`Stacked ${i}`, { description: "Hover the stack to expand" });
      }
    });
    root.appendChild(btn);
    return root;
  },
};
