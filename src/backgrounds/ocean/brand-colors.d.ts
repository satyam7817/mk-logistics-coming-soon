import type { OceanColors } from "./ocean-colors.js";
/**
 * Returns null for anything that is not a full six-digit hex. Callers fall back
 * to the packaged defaults -- an unreadable token and a legitimately dark token
 * must not produce the same silent black.
 */
export declare function hexToLinearRgb(hex: string): readonly [number, number, number] | null;
export declare function readOceanColors(element: Element): OceanColors;
