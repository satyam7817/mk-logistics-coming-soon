export type SimulationTargetName = "spectrum" | "ping" | "pong";
export interface IfftStage {
    readonly index: number;
    readonly axisStage: number;
    readonly horizontal: boolean;
    readonly subtransformSize: number;
    readonly input: SimulationTargetName;
    readonly output: Exclude<SimulationTargetName, "spectrum">;
}
export declare const OCEAN_RESOLUTION: 512;
/** The one immutable 18-pass Stockham table for the canonical 512² ocean. */
export declare function createIfftStageTable(): readonly IfftStage[];
