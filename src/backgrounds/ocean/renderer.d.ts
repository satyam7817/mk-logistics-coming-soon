import { type Draw, type Effect, type Frame, type Gpu, type Surface, type Target } from "vgpu";
import { type OceanColors } from "./ocean-colors.js";
import { type IfftStage } from "./ocean-graph.js";
type Output = Surface | Target;
interface RendererOptions {
    readonly canvas: HTMLCanvasElement;
    readonly colors?: OceanColors;
    readonly fps?: number;
    /**
     * Called once for any failure after construction -- init, resize rebuild, or
     * a throw inside the frame loop. Without it those failures rethrow, which in
     * the frame loop means an uncaught error and a hero that silently stops
     * updating. The caller is expected to swap in the fallback background.
     */
    readonly onError?: (error: unknown) => void;
}
type PointerTarget = readonly [number, number, number];
export declare function createRenderer({ canvas, colors, fps, onError, }: RendererOptions): {
    ready: Promise<void>;
    firstFrame: Promise<void>;
    dispose: () => void;
    setColors: (next: OceanColors) => void;
    setPaused: (next: boolean) => void;
    setPointer: (next: PointerTarget) => void;
};
export type OceanRenderer = ReturnType<typeof createRenderer>;
export declare function createGraph(gpu: Gpu, output: Output, label: string, colors?: OceanColors): Promise<OceanGraph>;
declare function buildGraph(gpu: Gpu, output: Output, label: string, colors: OceanColors, own: (value: Target) => Target): {
    simulation: {
        noise: Target;
        h0: Target;
        spectrum: Target;
        ping: Target;
        pong: Target;
        normalFoam: Target;
    };
    scene: Target;
    bloom: {
        bright: Target;
        composite: Target;
        levels: {
            horizontal: Target;
            vertical: Target;
            horizontalEffect: Effect;
            verticalEffect: Effect;
        }[];
    };
    effects: {
        noise: Effect;
        initialSpectrum: Effect;
        evolveSpectrum: Effect;
        normals: Effect;
        bright: Effect;
        composite: Effect;
        present: Effect;
    };
    ifft: {
        spec: IfftStage;
        effect: Effect;
        output: Target;
    }[];
    particles: Draw;
    needsInitialSpectrum: boolean;
};
export type OceanGraph = ReturnType<typeof buildGraph>;
/** Retunes the present pass in place. Allocates nothing. */
export declare function setPresentColors(graph: OceanGraph, colors: OceanColors): void;
export declare function renderAt(gpu: Gpu, graph: OceanGraph, output: Target, time: number): void;
export declare function renderGraph(currentFrame: Frame, graph: OceanGraph, output: Output): void;
export declare function bloomSizes(size: readonly [number, number]): [number, number][];
export declare function destroyGraph(graph: OceanGraph): void;
export {};
