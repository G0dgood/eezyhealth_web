/**
 * Shared modal width scale.
 *
 * Deliberately in PIXELS, not rem. `globals.css` sets `html { font-size: 12px }`,
 * so every rem-based Tailwind width renders at 75% of its nominal size — the old
 * `max-w-lg` default was 384px wide, not the 512px the class name implies, which
 * is what made the dialogs feel cramped. Pixel values are immune to that.
 *
 * Both Modal and FormModal read from here so the two scales can't drift apart.
 */
export const MODAL_SIZE_CLASSES = {
  sm: "max-w-[460px]",
  md: "max-w-[600px]",
  lg: "max-w-[800px]",
  xl: "max-w-[1040px]",
} as const;

export type ModalSize = keyof typeof MODAL_SIZE_CLASSES;
