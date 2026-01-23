import {
  mustBeBoolean,
  mustBeFiniteNumber,
  mustBeStringOrNull,
  toInt,
  toNonNegInt,
  toNonNegPx,
  toNullableNonNegPx,
} from "./action-validate";

describe("action-validate", () => {
  it("rejects invalid numbers", () => {
    expect(() => mustBeFiniteNumber("1", "value")).toThrow(
      "value must be a finite number",
    );
  });

  it("coerces integers and clamps non-negative", () => {
    expect(toInt(2.9, "value")).toBe(2);
    expect(toNonNegInt(-3, "value")).toBe(0);
  });

  it("clamps px values and supports nullable px", () => {
    expect(toNonNegPx(-10, "px")).toBe(0);
    expect(toNullableNonNegPx(null, "px")).toBeNull();
  });

  it("validates string-or-null and boolean", () => {
    expect(mustBeStringOrNull(null, "label")).toBeNull();
    expect(() => mustBeStringOrNull(42, "label")).toThrow(
      "label must be a string or null",
    );
    expect(() => mustBeBoolean("true", "flag")).toThrow(
      "flag must be a boolean",
    );
  });
});