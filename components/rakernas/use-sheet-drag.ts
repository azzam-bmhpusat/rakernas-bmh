"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  type MouseEvent,
  type PointerEvent,
} from "react";
import {
  sheetDragOffset,
  shouldDismissSheet,
  type DragSample,
} from "@/lib/sheet-drag";

type Gesture = {
  pointerId: number;
  handle: HTMLButtonElement;
  startX: number;
  startY: number;
  initialOffset: number;
  height: number;
  moved: boolean;
  samples: DragSample[];
};

export function useSheetDrag(open: boolean, onClose: () => void) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<Gesture | null>(null);
  const suppressClickRef = useRef(false);

  const releasePointer = useCallback(() => {
    const gesture = gestureRef.current;
    gestureRef.current = null;
    if (gesture?.handle.hasPointerCapture(gesture.pointerId)) {
      gesture.handle.releasePointerCapture(gesture.pointerId);
    }
  }, []);

  const reset = useCallback(() => {
    releasePointer();
    const sheet = sheetRef.current;
    sheet?.removeAttribute("data-dragging");
    sheet?.removeAttribute("data-returning");
    sheet?.style.removeProperty("--sheet-drag-offset");
    suppressClickRef.current = false;
  }, [releasePointer]);

  useLayoutEffect(() => {
    if (open) {
      reset();
    } else {
      // Keep the last offset until Base UI finishes its exit transition.
      releasePointer();
      sheetRef.current?.removeAttribute("data-dragging");
    }
    return releasePointer;
  }, [open, releasePointer, reset]);

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    const sheet = sheetRef.current;
    if (!open || !sheet || !event.isPrimary || event.button !== 0 || gestureRef.current) return;

    const rect = sheet.getBoundingClientRect();
    // Pick up an opening or returning panel at its current visual position.
    const initialOffset = sheetDragOffset(rect.bottom - window.innerHeight, rect.height);
    gestureRef.current = {
      pointerId: event.pointerId,
      handle: event.currentTarget,
      startX: event.clientX,
      startY: event.clientY,
      initialOffset,
      height: rect.height,
      moved: false,
      samples: [{ y: event.clientY, time: event.timeStamp }],
    };
    suppressClickRef.current = false;
    sheet.style.setProperty("--sheet-drag-offset", `${initialOffset}px`);
    sheet.removeAttribute("data-returning");
    sheet.setAttribute("data-dragging", "");
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || event.pointerId !== gesture.pointerId) return;

    const distance = event.clientY - gesture.startY;
    gesture.moved ||= Math.abs(distance) > 6 || Math.abs(event.clientX - gesture.startX) > 6;
    gesture.samples.push({ y: event.clientY, time: event.timeStamp });
    while (gesture.samples.length > 2 && gesture.samples[1].time < event.timeStamp - 100) {
      gesture.samples.shift();
    }
    sheetRef.current?.style.setProperty(
      "--sheet-drag-offset",
      `${sheetDragOffset(gesture.initialOffset + distance, gesture.height)}px`,
    );
  };

  const finishDrag = (event: PointerEvent<HTMLButtonElement>, cancelled = false) => {
    const gesture = gestureRef.current;
    const sheet = sheetRef.current;
    if (!gesture || !sheet || event.pointerId !== gesture.pointerId) return;

    if (!cancelled) onPointerMove(event);
    suppressClickRef.current = cancelled || gesture.moved;
    // Commit the final drag position before enabling the return/exit transition.
    sheet.getBoundingClientRect();
    releasePointer();
    sheet.removeAttribute("data-dragging");

    if (shouldDismissSheet(event.clientY - gesture.startY, gesture.samples, cancelled)) {
      onClose();
    } else {
      sheet.setAttribute("data-returning", "");
      sheet.style.setProperty("--sheet-drag-offset", "0px");
    }
  };

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    // Pointer drags may synthesize a click; keyboard activation still works.
    if (event.detail > 0 && suppressClickRef.current) {
      event.preventDefault();
      suppressClickRef.current = false;
      return;
    }
    if (open) onClose();
  };

  return {
    sheetRef,
    onOpenChangeComplete: (isOpen: boolean) => {
      if (!isOpen) reset();
    },
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: (event: PointerEvent<HTMLButtonElement>) => finishDrag(event),
      onPointerCancel: (event: PointerEvent<HTMLButtonElement>) => finishDrag(event, true),
      onLostPointerCapture: (event: PointerEvent<HTMLButtonElement>) => finishDrag(event, true),
      onClick,
    },
  };
}
