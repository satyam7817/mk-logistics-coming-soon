/**
 * Canonical parameter table copied from front/fft-ocean-1 DEFAULT_SETTINGS,
 * settings constants, uniform-packing, and bloom-pass.
 *
 * UPSTREAM_TUNING below is that table verbatim; HERO_OVERRIDES is ours. Keeping
 * them separate makes a reframe a readable diff against the example rather
 * than a rewrite of it.
 */
export interface OceanTuning {
    readonly simulation: {
        readonly oceanSize: number;
        readonly worldSize: number;
        readonly timeScale: number;
        readonly spectrumTimeScale: number;
        readonly windSpeed: number;
        readonly windAngle: number;
        readonly amplitude: number;
        readonly choppiness: number;
        readonly displacementScale: number;
        readonly foamThreshold: number;
    };
    readonly particles: {
        readonly pointSize: number;
        readonly fadeNear: number;
        readonly fadeFar: number;
        readonly fadePower: number;
        readonly oceanColor: readonly [number, number, number, number];
        readonly neonColor: readonly [number, number, number, number];
        readonly foamColor: readonly [number, number, number, number];
    };
    readonly camera: {
        readonly eye: readonly [number, number, number];
        readonly target: readonly [number, number, number];
        readonly pitchDegrees: number;
        readonly fovDegrees: number;
        readonly near: number;
        readonly far: number;
    };
    readonly present: {
        readonly fgColor: readonly [number, number, number];
        readonly bgColor: readonly [number, number, number];
        readonly brightness: number;
    };
    readonly bloom: {
        readonly threshold: number;
        readonly smoothWidth: number;
        readonly strength: number;
        readonly radius: number;
        readonly levels: number;
        readonly kernelRadii: readonly number[];
    };
    /**
     * Where the container's bottom fade starts, as a percentage of hero height.
     * 100 disables it. Applied as a CSS mask, not in the shader: the abrupt edge
     * it softens is the container clipping the canvas, which no amount of
     * distance fade can reach.
     */
    readonly bottomFadeStartPercent: number;
}
export declare const OCEAN_TUNING: OceanTuning;
/** Matches front's `gaussianCoefficients`: sigma=radius/3, no normalization pass. */
export declare function gaussianCoefficients(kernelRadius: number): readonly number[];
