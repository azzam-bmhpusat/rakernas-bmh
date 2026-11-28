import { describe, expect, it } from "vitest";
import { sheetDragOffset, shouldDismissSheet } from "@/lib/sheet-drag";

describe("bottom sheet drag", () => {
  it("limits movement to the panel height and prevents upward dragging", () => {
    expect(sheetDragOffset(-30, 500)).toBe(0);
    expect(sheetDragOffset(80, 500)).toBe(80);
    expect(sheetDragOffset(600, 500)).toBe(500);
  });

  it("dismisses at 96px, but returns a shorter slow drag", () => {
    expect(shouldDismissSheet(96, [])).toBe(true);
    expect(shouldDismissSheet(95, [{ y: 0, time: 0 }, { y: 95, time: 500 }])).toBe(false);
  });

  it("requires both 24px displacement and 0.6px/ms downward speed for a flick", () => {
    const flick = [{ y: 0, time: 0 }, { y: 24, time: 40 }];
    expect(shouldDismissSheet(24, flick)).toBe(true);
    expect(shouldDismissSheet(23, flick)).toBe(false);
    expect(shouldDismissSheet(24, [{ y: 0, time: 0 }, { y: 24, time: 41 }])).toBe(false);
  });

  it("uses only the last 100ms rather than an older fast movement", () => {
    expect(shouldDismissSheet(60, [
      { y: 0, time: 0 }, { y: 60, time: 40 }, { y: 60, time: 200 },
    ])).toBe(false);
    expect(shouldDismissSheet(60, [
      { y: 0, time: 0 }, { y: 24, time: 120 }, { y: 60, time: 180 },
    ])).toBe(true);
  });

  it("returns an upward flick, missing velocity samples, or zero elapsed time", () => {
    expect(shouldDismissSheet(40, [{ y: 80, time: 0 }, { y: 40, time: 40 }])).toBe(false);
    expect(shouldDismissSheet(40, [])).toBe(false);
    expect(shouldDismissSheet(40, [{ y: 0, time: 0 }, { y: 40, time: 0 }])).toBe(false);
    expect(shouldDismissSheet(-10, [{ y: 0, time: 0 }, { y: -10, time: 10 }])).toBe(false);
  });

  it("never dismisses cancelled gestures, even beyond the distance threshold", () => {
    expect(shouldDismissSheet(120, [], true)).toBe(false);
    expect(shouldDismissSheet(40, [{ y: 0, time: 0 }, { y: 40, time: 40 }], true)).toBe(false);
  });
});
