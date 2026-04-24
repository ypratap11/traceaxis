import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// @testing-library/react's asyncWrapper drains microtasks via
// jest.advanceTimersByTime(0) when it detects fake timers.
// Vitest does not expose a global `jest`, so we shim it here so RTL's
// async drain step works correctly when vi.useFakeTimers() is active.
if (typeof (globalThis as unknown as { jest?: unknown }).jest === "undefined") {
  Object.defineProperty(globalThis, "jest", {
    value: { advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms) },
    writable: true,
    configurable: true
  });
}

afterEach(() => {
  cleanup();
});
