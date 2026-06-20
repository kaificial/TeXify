// checks if the browser supports webgpu (needed for local AI)
export async function isWebGPUAvailable(): Promise<boolean> {
  const gpu = (navigator as unknown as Record<string, unknown>).gpu;

  if (typeof navigator === 'undefined' || !gpu) {
    return false;
  }

  try {
    const adapter = await (gpu as { requestAdapter: () => Promise<unknown | null> }).requestAdapter();
    return adapter !== null;
  } catch {
    return false;
  }
}
