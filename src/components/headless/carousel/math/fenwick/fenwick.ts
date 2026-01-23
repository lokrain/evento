// src/components/headless/carousel/math/fenwick/fenwick.ts

/**
 * Fenwick Tree / Binary Indexed Tree for non-negative weights.
 * - Indices are 0-based at the API boundary.
 * - Internal storage is 1-based for standard BIT math.
 */
export class FenwickTree {
  readonly size: number;
  private readonly tree: Float64Array;

  constructor(size: number) {
    if (!Number.isInteger(size) || size < 0) {
      throw new Error(`FenwickTree: size must be a non-negative integer, got ${size}`);
    }
    this.size = size;
    this.tree = new Float64Array(size + 1);
  }

  /** Adds delta to index i (0-based). */
  add(i: number, delta: number): void {
    if (!Number.isInteger(i) || i < 0 || i >= this.size) {
      throw new Error(`FenwickTree.add: index out of range: ${i}`);
    }
    // For our carousel use-cases, lengths should be non-negative.
    // Delta can be negative when updating an existing value.
    for (let x = i + 1; x <= this.size; x += x & -x) {
      this.tree[x] += delta;
    }
  }

  /** Returns sum of [0, end) where end is 0..size. */
  sum(end: number): number {
    if (!Number.isInteger(end) || end < 0 || end > this.size) {
      throw new Error(`FenwickTree.sum: end out of range: ${end}`);
    }
    let acc = 0;
    for (let x = end; x > 0; x -= x & -x) {
      acc += this.tree[x];
    }
    return acc;
  }

  /** Returns sum of [start, end) */
  rangeSum(start: number, end: number): number {
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || end > this.size) {
      throw new Error(`FenwickTree.rangeSum: invalid range [${start}, ${end})`);
    }
    return this.sum(end) - this.sum(start);
  }

  /** Returns the total sum of [0, size) */
  total(): number {
    return this.sum(this.size);
  }
 
  /**
   * Returns the smallest i in [0..size] such that sum(i) >= target.
   * If target <= 0 -> 0. If target > total -> size.
   *
   * Assumes represented values are non-negative.
   */
  lowerBound(target: number): number {
    if (!Number.isFinite(target)) {
      throw new Error(`FenwickTree.lowerBound: target must be finite, got ${target}`);
    }
    if (target <= 0) return 0;

    const total = this.total();
    if (target > total) return this.size;

    // Standard BIT lowerBound using internal tree array.
    // idx is 1-based internally; we return 0-based boundary.
    let idx = 0; // 1-based "prefix length" position
    let bit = 1;

    while ((bit << 1) <= this.size) bit <<= 1;

    let acc = 0;

    for (; bit !== 0; bit >>= 1) {
      const next = idx + bit;
      if (next <= this.size) {
        const nextSum = acc + this.tree[next];
        if (nextSum < target) {
          acc = nextSum;
          idx = next;
        }
      }
    }

    return idx; // idx is prefix length in 1-based terms; equals boundary in 0-based
  }

}
