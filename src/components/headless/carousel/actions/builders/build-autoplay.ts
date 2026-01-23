import type { CarouselAction, GateKey } from "../action-types";
import { mustBeBoolean, toNonNegInt } from "../action-validate";

/**
 * Autoplay + gates action builders.
 *
 * Design goals:
 * - Actions remain JSON-ish (numbers/booleans/strings), easy to log/serialize.
 * - Validation is strict and assertion-free.
 * - "source" is required for traceability.
 */

export function buildGateSet(params: {
  readonly gate: GateKey;
  readonly value: unknown;
  readonly source: "dom" | "policy" | "api";
}): CarouselAction {
  const v = mustBeBoolean(params.value, "value");
  return {
    type: "GATE/SET",
    payload: { gate: params.gate, value: v, source: params.source },
  };
}

export function buildAutoplaySetEnabled(params: {
  readonly enabled: unknown;
  readonly source: "api" | "policy";
}): CarouselAction {
  const enabled = mustBeBoolean(params.enabled, "enabled");
  return {
    type: "AUTOPLAY/SET_ENABLED",
    payload: { enabled, source: params.source },
  };
}

export function buildAutoplaySetInterval(params: {
  readonly intervalMs: unknown;
  readonly source: "api" | "policy";
}): CarouselAction {
  const intervalMs = toNonNegInt(params.intervalMs, "intervalMs");
  return {
    type: "AUTOPLAY/SET_INTERVAL",
    payload: { intervalMs, source: params.source },
  };
}

export function buildAutoplayManualPause(params: {
  readonly paused: unknown;
  readonly source: "api" | "dom";
}): CarouselAction {
  const paused = mustBeBoolean(params.paused, "paused");
  return {
    type: "AUTOPLAY/MANUAL_PAUSE",
    payload: { paused, source: params.source },
  };
}
