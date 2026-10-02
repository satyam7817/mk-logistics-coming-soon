/**
 * `navigator.gpu` existing is not support: a blocklisted driver, a headless
 * container, or a software-only adapter all expose the namespace and then
 * return null from requestAdapter().
 */
export async function probeWebgpuSupport() {
    const gpu = navigator.gpu;
    if (!gpu || typeof gpu.requestAdapter !== "function")
        return "unsupported";
    try {
        const adapter = await gpu.requestAdapter();
        return adapter ? "supported" : "unsupported";
    }
    catch {
        return "probe-failed";
    }
}
