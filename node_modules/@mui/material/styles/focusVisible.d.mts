import type * as React from 'react';
export declare const outsetFocusRing: {
  "--_focusVisible-offset": number;
  "--_focusVisible-behavior": string;
};
export declare function applyChildrenFocusVisible(color: string): {
  "--_focusVisible-shadow": string;
};
export declare function applyInsetFocusVisible(offset: number): {
  "--_focusVisible-offset": number;
  "--_focusVisible-behavior": string;
};
export type FocusVisibleInput = boolean | React.CSSProperties | null | undefined;
export declare function mergeFocusVisibleInput(optionsFocusVisible: FocusVisibleInput, args: readonly any[]): FocusVisibleInput;
/**
 * Whether an input is this module's own output. Only `wireFocusVisibleVars` emits the offset calc,
 * so it identifies a ring fed back in by `createTheme(existingTheme, …)`.
 */
export declare function isResolvedFocusVisible(input: FocusVisibleInput): boolean;
/**
 * Resolve the opt-in ring, wiring in the private inset vars. `outlineColor` is the caller's default
 * — a hex, the palette var, or a scheme's primary — overridden by a user-provided `outlineColor`.
 */
export declare function resolveFocusVisible(input: true | React.CSSProperties, outlineColor: string): React.CSSProperties;
/**
 * Wire the private inset vars into a resolved `theme.focusVisible` so a custom `outlineOffset` or
 * `boxShadow` insets automatically on clip-prone components. Mutates and returns the object.
 */
export declare function wireFocusVisibleVars(resolved: React.CSSProperties): React.CSSProperties;