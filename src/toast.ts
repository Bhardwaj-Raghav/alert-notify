import { createToaster, type ToasterInstance } from "./create-toaster";

/**
 * Default shared toaster. Auto-mounts a portal in the browser.
 * Methods (`success`, `promise`, `config`, …) are documented on {@link ToasterInstance}.
 */
export const toast: ToasterInstance = createToaster();
