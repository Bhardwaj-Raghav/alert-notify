import { createToaster, type ToasterInstance } from "./create-toaster";

/** Default toaster instance. Auto-mounts a portal in the browser. */
export const toast: ToasterInstance = createToaster();
