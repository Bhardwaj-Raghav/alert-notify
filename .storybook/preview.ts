import "../src/styles/toast.css";
import { toast } from "../src/toast";

toast.config({
  position: "top-right",
  theme: "system",
  richColors: false,
  progressBar: true,
});

export const parameters = {
  layout: "centered",
  controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
};
