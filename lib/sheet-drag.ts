export type DragSample = { y: number; time: number };

export function sheetDragOffset(distance: number, height: number) {
  return Math.max(0, Math.min(distance, height));
}

export function shouldDismissSheet(
  distance: number,
  samples: readonly DragSample[],
  cancelled = false,
) {
  if (cancelled) return false;
  if (distance >= 96) return true;
  if (distance < 24 || samples.length < 2) return false;

  const last = samples[samples.length - 1];
  const first = samples.find((sample) => sample.time >= last.time - 100)!;
  const elapsed = last.time - first.time;
  return elapsed > 0 && (last.y - first.y) / elapsed >= 0.6;
}
