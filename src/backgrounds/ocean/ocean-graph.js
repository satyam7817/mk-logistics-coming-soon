export const OCEAN_RESOLUTION = 512;
const AXIS_STAGES = 9;
/** The one immutable 18-pass Stockham table for the canonical 512² ocean. */
export function createIfftStageTable() {
    return Object.freeze(Array.from({ length: AXIS_STAGES * 2 }, (_, index) => {
        const output = index % 2 ? "pong" : "ping";
        return Object.freeze({
            index,
            axisStage: index % AXIS_STAGES,
            horizontal: index < AXIS_STAGES,
            subtransformSize: 2 ** ((index % AXIS_STAGES) + 1),
            input: index === 0 ? "spectrum" : output === "ping" ? "pong" : "ping",
            output,
        });
    }));
}
